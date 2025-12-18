import type { AppConfig, AIGroupResult } from '@/types'
import { getConfig, requestAIGrouping } from './openai'
import {
  getCurrentWindowTabs,
  getCurrentWindowGroups,
  prepareTabsForAI,
  createTabGroup,
  ungroupTabs,
  collapseGroup
} from './tabs'

export interface GroupingProgress {
  status: 'preparing' | 'requesting' | 'applying' | 'done' | 'error'
  message: string
  progress?: number
}

export type ProgressCallback = (progress: GroupingProgress) => void

// 执行 AI 分组的主函数
export async function executeAIGrouping(
  mode: 'window' | 'group',
  onProgress?: ProgressCallback
): Promise<void> {
  const report = (status: GroupingProgress['status'], message: string, progress?: number) => {
    onProgress?.({ status, message, progress })
  }

  try {
    // 1. 获取配置
    report('preparing', '正在加载配置...', 10)
    const config = await getConfig()
    if (!config) {
      throw new Error('请先在设置中配置 OpenAI API Key')
    }
    if (!config.openai.apiKey) {
      throw new Error('请先在设置中配置 OpenAI API Key')
    }

    // 2. 获取当前标签页和分组
    report('preparing', '正在获取标签页信息...', 20)
    const tabs = await getCurrentWindowTabs()
    const groups = await getCurrentWindowGroups()

    // 3. 准备发送给 AI 的数据
    report('preparing', '正在准备数据...', 30)
    let tabsForAI = await prepareTabsForAI(
      tabs,
      groups,
      config.aiGroup.ignorePinnedTabs
    )

    // 如果是"当前组"模式，只处理当前激活标签所在组的标签
    if (mode === 'group') {
      const activeTab = tabs.find(t => t.groupId !== -1)
      if (activeTab && activeTab.groupId !== -1) {
        tabsForAI = tabsForAI.filter(t => {
          const originalTab = tabs.find(ot => ot.id === t.id)
          return originalTab?.groupId === activeTab.groupId
        })
      }
    }

    if (tabsForAI.length === 0) {
      throw new Error('没有可分组的标签页')
    }

    // 4. 请求 AI 分组
    report('requesting', '正在请求 AI 分析...', 50)
    const aiResult = await requestAIGrouping(tabsForAI, config)

    // 5. 应用分组结果
    report('applying', '正在应用分组...', 70)
    await applyGroupingResult(aiResult, config)

    report('done', '分组完成！', 100)
  } catch (error: any) {
    report('error', error.message || '分组失败', 0)
    throw error
  }
}

// 应用 AI 返回的分组结果
async function applyGroupingResult(
  result: AIGroupResult,
  config: AppConfig
): Promise<void> {
  // 先取消需要重新分组的标签的分组
  const allTabIds = [
    ...result.groups.flatMap(g => g.tabIds),
    ...result.ungroupedTabIds
  ]

  // 获取这些标签当前的分组状态
  const currentTabs = await getCurrentWindowTabs()
  const tabsToUngroup = allTabIds.filter(id => {
    const tab = currentTabs.find(t => t.id === id)
    return tab && tab.groupId !== -1
  })

  if (tabsToUngroup.length > 0 && !config.aiGroup.keepExistingGroups) {
    await ungroupTabs(tabsToUngroup)
  }

  // 创建新分组
  for (const group of result.groups) {
    if (group.tabIds.length === 0) continue

    // 验证标签 ID 是否有效
    const validTabIds = group.tabIds.filter(id =>
      currentTabs.some(t => t.id === id)
    )

    if (validTabIds.length === 0) continue

    const groupId = await createTabGroup(
      validTabIds,
      group.name,
      group.color
    )

    // 如果配置了自动折叠
    if (config.aiGroup.autoCollapseNewGroups) {
      await collapseGroup(groupId, true)
    }
  }
}

// 导出便捷方法
export { getConfig } from './openai'
export {
  getCurrentWindowTabs,
  getCurrentWindowGroups
} from './tabs'
