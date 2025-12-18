import OpenAI from 'openai'
import type { AppConfig, TabForAI, AIGroupResult } from '@/types'

// 获取配置
export async function getConfig(): Promise<AppConfig | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['config'], (result) => {
      if (result.config && typeof result.config === 'object') {
        resolve(result.config as AppConfig)
      } else {
        resolve(null)
      }
    })
  })
}

// 创建 OpenAI 客户端
export function createOpenAIClient(config: AppConfig): OpenAI {
  return new OpenAI({
    apiKey: config.openai.apiKey,
    baseURL: config.openai.baseUrl || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true
  })
}

// 构建 AI 分组提示词
function buildPrompt(tabs: TabForAI[], config: AppConfig): string {
  const tabsInfo = tabs.map(tab => {
    let info = `- ID: ${tab.id}, 标题: "${tab.title}", 域名: ${tab.domain}`
    if (tab.existingGroup) {
      info += `, 当前分组: "${tab.existingGroup}"`
    }
    return info
  }).join('\n')

  const rules: string[] = []

  if (config.aiGroup.keepExistingGroups) {
    rules.push('- 尽量保持已有分组不变，只对未分组的标签进行分类')
  }

  if (config.aiGroup.singleTabNoGroup) {
    rules.push('- 如果某个分类只有一个标签，将其放入 ungroupedTabIds 而不是创建单独分组')
  }

  rules.push('- 分组名称应简洁明了（2-4个中文字或英文单词）')
  rules.push('- 根据标签的内容和用途进行智能分类，相似主题的放在一起')
  rules.push('- 可用的颜色: grey, blue, red, yellow, green, pink, purple, cyan, orange')

  return `你是一个浏览器标签页分组助手。请根据以下标签页信息，将它们智能分组。

当前标签页列表：
${tabsInfo}

分组规则：
${rules.join('\n')}

请以 JSON 格式返回分组结果，格式如下：
{
  "groups": [
    {
      "name": "分组名称",
      "color": "颜色",
      "tabIds": [标签ID数组]
    }
  ],
  "ungroupedTabIds": [不需要分组的标签ID数组]
}

只返回 JSON，不要有其他文字。`
}

// 调用 AI 进行分组
export async function requestAIGrouping(
  tabs: TabForAI[],
  config: AppConfig
): Promise<AIGroupResult> {
  const openai = createOpenAIClient(config)
  const prompt = buildPrompt(tabs, config)

  const response = await openai.chat.completions.create({
    model: config.openai.model || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的浏览器标签页分组助手，擅长根据标签页内容进行智能分类。只返回 JSON 格式的结果。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 未返回有效响应')
  }

  try {
    const result = JSON.parse(content) as AIGroupResult
    return result
  } catch {
    throw new Error('AI 返回的格式无法解析')
  }
}
