// Chrome 标签组颜色类型
export type TabGroupColor = 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' | 'orange'

// 标签页信息
export interface TabInfo {
  id: number
  title: string
  url: string
  favIconUrl?: string
  pinned: boolean
  groupId: number // -1 表示未分组
}

// 现有分组信息
export interface GroupInfo {
  id: number
  title: string
  color: TabGroupColor
  tabIds: number[]
}

// AI 返回的分组建议
export interface GroupSuggestion {
  name: string
  color: TabGroupColor
  tabIds: number[]
}

// AI 分组结果
export interface AIGroupResult {
  groups: GroupSuggestion[]
  ungroupedTabIds: number[] // 不需要分组的标签（如单个标签）
}

// 发送给 AI 的标签简化信息
export interface TabForAI {
  id: number
  title: string
  url: string
  domain: string
  existingGroup?: string // 如果已有分组，提供分组名
}

// 配置类型
export interface AppConfig {
  openai: {
    useMethod: 'api' | 'web'
    baseUrl: string
    apiKey: string
    model: string
  }
  instantGroup: {
    enabled: boolean
    namingMethod: 'fixed' | 'rule'
    threshold: number // default 10, 0 = always AI
  }
  aiGroup: {
    keepExistingGroups: boolean
    ignorePinnedTabs: boolean
    autoCollapseNewGroups: boolean
    singleTabNoGroup: boolean
  }
}

// Chrome 标签组颜色列表
export const TAB_GROUP_COLORS: TabGroupColor[] = [
  'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'
]
