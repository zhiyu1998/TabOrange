import type { TabInfo, GroupInfo, TabForAI, TabGroupColor } from '@/types'

// 提取 URL 的域名
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

// 获取当前窗口的所有标签页
export async function getCurrentWindowTabs(): Promise<TabInfo[]> {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  return tabs.map(tab => ({
    id: tab.id!,
    title: tab.title || '',
    url: tab.url || '',
    favIconUrl: tab.favIconUrl,
    pinned: tab.pinned || false,
    groupId: tab.groupId ?? -1
  }))
}

// 获取当前窗口的所有分组
export async function getCurrentWindowGroups(): Promise<GroupInfo[]> {
  const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT })
  const tabs = await getCurrentWindowTabs()

  return groups.map(group => ({
    id: group.id,
    title: group.title || '',
    color: group.color as TabGroupColor,
    tabIds: tabs.filter(tab => tab.groupId === group.id).map(tab => tab.id)
  }))
}

// 将标签页转换为 AI 需要的格式
export async function prepareTabsForAI(
  tabs: TabInfo[],
  groups: GroupInfo[],
  ignorePinnedTabs: boolean
): Promise<TabForAI[]> {
  // 创建 groupId -> groupTitle 的映射
  const groupMap = new Map<number, string>()
  groups.forEach(g => groupMap.set(g.id, g.title))

  return tabs
    .filter(tab => {
      // 过滤掉固定标签（如果配置了）
      if (ignorePinnedTabs && tab.pinned) return false
      // 过滤掉 chrome:// 等系统页面
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return false
      return true
    })
    .map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      domain: extractDomain(tab.url),
      existingGroup: tab.groupId !== -1 ? groupMap.get(tab.groupId) : undefined
    }))
}

// 创建新的标签组
export async function createTabGroup(
  tabIds: number[],
  title: string,
  color: TabGroupColor
): Promise<number> {
  if (tabIds.length === 0) {
    throw new Error('No tabs to group')
  }
  // 先将标签添加到组
  const groupId = await chrome.tabs.group({ tabIds: tabIds as [number, ...number[]] })
  // 设置组的属性
  await chrome.tabGroups.update(groupId, { title, color })
  return groupId
}

// 将标签添加到现有组
export async function addTabsToGroup(tabIds: number[], groupId: number): Promise<void> {
  if (tabIds.length === 0) return
  await chrome.tabs.group({ tabIds: tabIds as [number, ...number[]], groupId })
}

// 从组中移除标签（取消分组）
export async function ungroupTabs(tabIds: number[]): Promise<void> {
  if (tabIds.length === 0) return
  await chrome.tabs.ungroup(tabIds as [number, ...number[]])
}

// 折叠/展开标签组
export async function collapseGroup(groupId: number, collapsed: boolean): Promise<void> {
  await chrome.tabGroups.update(groupId, { collapsed })
}
