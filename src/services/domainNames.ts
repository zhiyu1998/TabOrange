// Domain to friendly name mapping for simplified group names
const DOMAIN_NAMES: Record<string, string> = {
  // Search & Portals
  'google.com': 'Google',
  'bing.com': 'Bing',
  'baidu.com': 'Baidu',
  'yahoo.com': 'Yahoo',
  'duckduckgo.com': 'DuckDuckGo',

  // Social Media
  'twitter.com': 'Twitter',
  'x.com': 'Twitter',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'linkedin.com': 'LinkedIn',
  'reddit.com': 'Reddit',
  'weibo.com': 'Weibo',
  'zhihu.com': 'Zhihu',

  // Video & Streaming
  'youtube.com': 'YouTube',
  'bilibili.com': 'Bilibili',
  'netflix.com': 'Netflix',
  'twitch.tv': 'Twitch',
  'vimeo.com': 'Vimeo',

  // Development
  'github.com': 'GitHub',
  'gitlab.com': 'GitLab',
  'bitbucket.org': 'Bitbucket',
  'stackoverflow.com': 'StackOverflow',
  'npmjs.com': 'npm',
  'dev.to': 'Dev.to',
  'medium.com': 'Medium',
  'hackernews.com': 'HackerNews',
  'news.ycombinator.com': 'HackerNews',

  // Productivity
  'notion.so': 'Notion',
  'trello.com': 'Trello',
  'asana.com': 'Asana',
  'slack.com': 'Slack',
  'discord.com': 'Discord',
  'figma.com': 'Figma',

  // Cloud & Docs
  'docs.google.com': 'Google Docs',
  'drive.google.com': 'Google Drive',
  'dropbox.com': 'Dropbox',
  'onedrive.live.com': 'OneDrive',

  // Shopping
  'amazon.com': 'Amazon',
  'amazon.cn': 'Amazon',
  'ebay.com': 'eBay',
  'taobao.com': 'Taobao',
  'jd.com': 'JD',
  'tmall.com': 'Tmall',

  // News
  'bbc.com': 'BBC',
  'cnn.com': 'CNN',
  'nytimes.com': 'NYTimes',
  'theguardian.com': 'Guardian',

  // AI & Tech
  'openai.com': 'OpenAI',
  'chat.openai.com': 'ChatGPT',
  'anthropic.com': 'Anthropic',
  'claude.ai': 'Claude',
  'huggingface.co': 'HuggingFace',

  // Email
  'mail.google.com': 'Gmail',
  'outlook.live.com': 'Outlook',
  'outlook.office.com': 'Outlook',

  // Wikipedia
  'wikipedia.org': 'Wikipedia',
  'en.wikipedia.org': 'Wikipedia',
  'zh.wikipedia.org': 'Wikipedia',
}

/**
 * Get a simplified, human-friendly name for a domain
 * @param hostname - The hostname (e.g., "github.com", "www.google.com")
 * @returns Simplified name (e.g., "GitHub", "Google")
 */
export function getSimplifiedDomainName(hostname: string): string {
  // Check exact match first
  if (DOMAIN_NAMES[hostname]) {
    return DOMAIN_NAMES[hostname]
  }

  // Remove www. prefix and check again
  const noWww = hostname.replace(/^www\./, '')
  if (DOMAIN_NAMES[noWww]) {
    return DOMAIN_NAMES[noWww]
  }

  // Check if subdomain matches a known domain
  // e.g., "api.github.com" should match "github.com"
  const parts = noWww.split('.')
  if (parts.length > 2) {
    const baseDomain = parts.slice(-2).join('.')
    if (DOMAIN_NAMES[baseDomain]) {
      return DOMAIN_NAMES[baseDomain]
    }
  }

  // Fallback: capitalize the first part of domain
  // e.g., "example.com" → "Example"
  // e.g., "my-awesome-site.io" → "My-awesome-site"
  const name = parts[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}
