<script setup lang="ts">
import { ref } from 'vue'
import { executeAIGrouping, type GroupingProgress } from '@/services/grouping'

const activeTab = ref<'window' | 'group'>('window')
const isProcessing = ref(false)
const statusMessage = ref('')
const progress = ref(0)
const hasError = ref(false)

const handleAIGroup = async () => {
  isProcessing.value = true
  hasError.value = false
  statusMessage.value = ''
  progress.value = 0

  try {
    await executeAIGrouping(activeTab.value, (p: GroupingProgress) => {
      statusMessage.value = p.message
      progress.value = p.progress || 0

      if (p.status === 'error') {
        hasError.value = true
      }

      if (p.status === 'done') {
        // 分组完成后延迟关闭
        setTimeout(() => {
          window.close()
        }, 1000)
      }
    })
  } catch (error: any) {
    hasError.value = true
    statusMessage.value = error.message || '分组失败'
  } finally {
    isProcessing.value = false
  }
}

const openSettings = () => {
  chrome.runtime.openOptionsPage()
}
</script>

<template>
  <div class="popup-container">
    <!-- 一键AI分组按钮 -->
    <button class="ai-group-btn" @click="handleAIGroup" :disabled="isProcessing">
      <span v-if="!isProcessing" class="play-icon"></span>
      <span v-else class="loading-spinner"></span>
      {{ isProcessing ? '分组中...' : '一键AI分组' }}
    </button>

    <!-- 进度条 -->
    <div v-if="isProcessing || statusMessage" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="status-message" :class="{ error: hasError }">{{ statusMessage }}</p>
    </div>

    <!-- 切换选项卡 -->
    <div class="tab-switch">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'window' }"
        @click="activeTab = 'window'"
        :disabled="isProcessing"
      >
        当前窗口
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'group' }"
        @click="activeTab = 'group'"
        :disabled="isProcessing"
      >
        当前组
      </button>
    </div>

    <!-- Logo -->
    <div class="logo-container">
      <div class="logo-text">A<span>i</span></div>
      <div class="decoration"></div>
    </div>

    <!-- 底部信息 -->
    <div class="footer">
      <div class="version">TabOrange · V0.0.1</div>
      <a class="settings-link" @click="openSettings">打开设置</a>
    </div>
  </div>
</template>

<style scoped>
.popup-container {
  width: 280px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* 一键AI分组按钮 */
.ai-group-btn {
  width: 100%;
  background: linear-gradient(135deg, #e8a0a0 0%, #d4848a 100%);
  border: none;
  border-radius: 25px;
  padding: 14px 24px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 132, 138, 0.4);
}

.ai-group-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 132, 138, 0.5);
}

.ai-group-btn:active:not(:disabled) {
  transform: translateY(0);
}

.ai-group-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.play-icon {
  width: 0;
  height: 0;
  border-left: 10px solid white;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 进度条区域 */
.progress-section {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #e8a0a0 0%, #d4848a 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.status-message {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.status-message.error {
  color: #f44336;
}

/* 切换选项卡 */
.tab-switch {
  background: #f5f5f5;
  border-radius: 25px;
  padding: 4px;
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: #d4848a;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover:not(.active):not(:disabled) {
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Logo区域 */
.logo-container {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #f8e8e8 0%, #f0d8d8 100%);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(212, 132, 138, 0.2);
}

.logo-container::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background: white;
  border-radius: 14px;
}

.logo-text {
  position: relative;
  z-index: 1;
  font-size: 72px;
  font-weight: 300;
  color: #c87880;
  font-family: 'Times New Roman', serif;
}

.logo-text span {
  font-size: 48px;
  color: #d4848a;
  font-weight: 400;
}

/* 装饰小方块 */
.decoration {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #d4848a 0%, #c87880 100%);
  border-radius: 8px;
  z-index: 2;
}

/* 底部信息 */
.footer {
  text-align: center;
  color: #999;
  font-size: 13px;
}

.version {
  margin-bottom: 6px;
}

.settings-link {
  color: #999;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.settings-link:hover {
  color: #d4848a;
}
</style>
