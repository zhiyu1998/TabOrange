import { extractDomain } from '../services/tabs'
import { getSimplifiedDomainName } from '../services/domainNames'
import { getConfig } from '../services/openai'
import { executeAIGrouping } from '../services/grouping'
import type { TabGroupColor } from '../types'

// Per-window state tracking
interface WindowState {
  ungroupedCount: number
  domainGroups: Map<string, number> // domain -> groupId
  isProcessing: boolean // prevent concurrent AI calls
}

const windowStates = new Map<number, WindowState>()

function getWindowState(windowId: number): WindowState {
  if (!windowStates.has(windowId)) {
    windowStates.set(windowId, {
      ungroupedCount: 0,
      domainGroups: new Map(),
      isProcessing: false
    })
  }
  return windowStates.get(windowId)!
}

// Check if URL is a system page that should be ignored
function isSystemPage(url: string): boolean {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://') ||
    url.startsWith('file://') ||
    url === ''
  )
}

// Deterministic color based on domain hash
function getDeterministicColor(domain: string): TabGroupColor {
  const colors: TabGroupColor[] = [
    'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'
  ]
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash) + domain.charCodeAt(i)
    hash |= 0
  }
  return colors[Math.abs(hash) % colors.length]
}

// Create a new domain-based group
async function createDomainGroup(
  tab: chrome.tabs.Tab,
  domain: string,
  displayName: string,
  state: WindowState
): Promise<void> {
  try {
    const groupId = await chrome.tabs.group({
      tabIds: [tab.id!],
      createProperties: { windowId: tab.windowId }
    })
    await chrome.tabGroups.update(groupId, {
      title: displayName,
      color: getDeterministicColor(domain)
    })
    state.domainGroups.set(domain, groupId)
  } catch (error) {
    console.error('[TabOrange] Failed to create domain group:', error)
  }
}

// Group a tab by its domain
async function groupTabByDomain(
  tab: chrome.tabs.Tab,
  state: WindowState
): Promise<void> {
  const domain = extractDomain(tab.url!)
  const displayName = getSimplifiedDomainName(domain)

  if (state.domainGroups.has(domain)) {
    // Try to add to existing domain group
    const groupId = state.domainGroups.get(domain)!
    try {
      await chrome.tabs.group({ tabIds: [tab.id!], groupId })
    } catch {
      // Group may have been deleted by user, create a new one
      state.domainGroups.delete(domain)
      await createDomainGroup(tab, domain, displayName, state)
    }
  } else {
    // Create new domain group
    await createDomainGroup(tab, domain, displayName, state)
  }
}

// Trigger AI grouping for a specific window
async function triggerAIGroupingForWindow(windowId: number): Promise<void> {
  const state = getWindowState(windowId)

  // Prevent concurrent AI calls
  if (state.isProcessing) {
    console.log('[TabOrange] AI grouping already in progress, skipping')
    return
  }

  state.isProcessing = true

  try {
    console.log('[TabOrange] Triggering AI grouping for window', windowId)
    // AI grouping replaces all groups (clean slate approach)
    await executeAIGrouping('window')
    console.log('[TabOrange] AI grouping completed')
  } catch (error) {
    console.error('[TabOrange] AI grouping failed:', error)
  } finally {
    state.isProcessing = false
    // Reset counter and clear domain groups after AI processes
    state.ungroupedCount = 0
    state.domainGroups.clear()
  }
}

// Track tabs that have been processed to avoid duplicate processing
const processedTabs = new Set<number>()

// Main tab update listener
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when page is fully loaded
  if (changeInfo.status !== 'complete') return

  // Skip if no URL or window
  if (!tab.url || !tab.windowId) return

  // Skip system pages
  if (isSystemPage(tab.url)) return

  // Skip if already in a group
  if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) return

  // Skip if already processed this tab (prevents duplicate processing)
  if (processedTabs.has(tabId)) return
  processedTabs.add(tabId)

  // Clear from processed after a delay to allow re-processing if URL changes
  setTimeout(() => processedTabs.delete(tabId), 5000)

  try {
    const config = await getConfig()

    // Check if instant grouping is enabled
    if (!config?.instantGroup?.enabled) return

    // Check if we should ignore pinned tabs
    if (config.aiGroup?.ignorePinnedTabs && tab.pinned) return

    const threshold = config.instantGroup.threshold ?? 10
    const state = getWindowState(tab.windowId)

    console.log(`[TabOrange] Processing tab: ${tab.title}, threshold: ${threshold}, count: ${state.ungroupedCount}`)

    if (threshold === 0) {
      // Always AI mode - trigger immediately
      await triggerAIGroupingForWindow(tab.windowId)
    } else {
      // Domain grouping mode
      await groupTabByDomain(tab, state)
      state.ungroupedCount++

      console.log(`[TabOrange] Ungrouped count: ${state.ungroupedCount}/${threshold}`)

      if (state.ungroupedCount >= threshold) {
        await triggerAIGroupingForWindow(tab.windowId)
      }
    }
  } catch (error) {
    console.error('[TabOrange] Error processing tab:', error)
  }
})

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  processedTabs.delete(tabId)
})

// Clean up when window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  windowStates.delete(windowId)
})

// Clean up domain group reference when a group is deleted
chrome.tabGroups.onRemoved.addListener((group) => {
  const state = windowStates.get(group.windowId)
  if (state) {
    // Find and remove the domain mapping for this group
    for (const [domain, groupId] of state.domainGroups.entries()) {
      if (groupId === group.id) {
        state.domainGroups.delete(domain)
        break
      }
    }
  }
})

console.log('[TabOrange] Background service worker initialized')
