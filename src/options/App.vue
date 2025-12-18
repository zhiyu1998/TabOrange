<script setup lang="ts">
import { reactive } from 'vue'

// 配置状态
const config = reactive({
  // OpenAI 配置
  openai: {
    useMethod: 'api' as 'api' | 'web',
    baseUrl: '',
    apiKey: ''
  },
  // 即刻分组
  instantGroup: {
    enabled: true,
    namingMethod: 'rule' as 'fixed' | 'rule'
  },
  // AI智能分组
  aiGroup: {
    keepExistingGroups: true,
    ignorePinnedTabs: true,
    autoCollapseNewGroups: false,
    singleTabNoGroup: true
  }
})

// 折叠状态
const collapsedSections = reactive({
  openai: false,
  instantGroup: false,
  aiGroup: false
})

const toggleSection = (section: keyof typeof collapsedSections) => {
  collapsedSections[section] = !collapsedSections[section]
}

// 保存配置
const saveConfig = () => {
  chrome.storage.sync.set({ config }, () => {
    console.log('配置已保存')
  })
}

// 加载配置
const loadConfig = () => {
  chrome.storage.sync.get(['config'], (result) => {
    if (result.config) {
      Object.assign(config, result.config)
    }
  })
}

// 初始化加载
loadConfig()
</script>

<template>
  <div class="container">
    <!-- OpenAI 配置 -->
    <div class="section" :class="{ collapsed: collapsedSections.openai }">
      <div class="section-header" @click="toggleSection('openai')">
        <span class="section-title">OpenAI 配置</span>
        <span class="section-arrow">▼</span>
      </div>
      <div class="section-content">
        <p class="description">制定插件使用AI的方式，并设置OpenAI API Key。</p>

        <div class="form-group">
          <label class="form-label">ChatGPT使用方式</label>
          <div class="radio-group">
            <div
              class="radio-button"
              :class="{ active: config.openai.useMethod === 'api' }"
              @click="config.openai.useMethod = 'api'"
            >
              OpenAI API
            </div>
            <div
              class="radio-button"
              :class="{ active: config.openai.useMethod === 'web' }"
              @click="config.openai.useMethod = 'web'"
            >
              ChatGPT 网页
            </div>
          </div>
          <p class="hint-text">ChatGPT 网页 支持正在开发中...</p>
        </div>

        <div class="form-group">
          <label class="form-label">OpenAI BaseURL</label>
          <input
            type="text"
            class="input-field"
            v-model="config.openai.baseUrl"
            placeholder="https://api.openai.com/v1"
            @change="saveConfig"
          >
        </div>

        <div class="form-group">
          <label class="form-label">OpenAI API Key</label>
          <input
            type="password"
            class="input-field"
            v-model="config.openai.apiKey"
            placeholder="输入你的API Key"
            @change="saveConfig"
          >
        </div>
      </div>
    </div>

    <!-- 即刻分组 -->
    <div class="section" :class="{ collapsed: collapsedSections.instantGroup }">
      <div class="section-header" @click="toggleSection('instantGroup')">
        <span class="section-title">即刻分组</span>
        <span class="section-arrow">▼</span>
      </div>
      <div class="section-content">
        <p class="description">当您打开一个新的标签页时，将自动将其添加到当前组中。</p>

        <div class="toggle-group">
          <span class="toggle-label">启用即刻分组</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.instantGroup.enabled" @change="saveConfig">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">分组命名方式</label>
          <div class="radio-group">
            <div
              class="radio-button"
              :class="{ active: config.instantGroup.namingMethod === 'fixed' }"
              @click="config.instantGroup.namingMethod = 'fixed'; saveConfig()"
            >
              固定
            </div>
            <div
              class="radio-button"
              :class="{ active: config.instantGroup.namingMethod === 'rule' }"
              @click="config.instantGroup.namingMethod = 'rule'; saveConfig()"
            >
              规则
            </div>
          </div>
          <p class="hint-text">AI命名分组正在开发中...</p>
        </div>
      </div>
    </div>

    <!-- AI智能分组 -->
    <div class="section" :class="{ collapsed: collapsedSections.aiGroup }">
      <div class="section-header" @click="toggleSection('aiGroup')">
        <span class="section-title">AI智能分组</span>
        <span class="section-arrow">▼</span>
      </div>
      <div class="section-content">
        <p class="description">按您的需求，自定义AI分组的行为</p>

        <div class="toggle-group">
          <span class="toggle-label">默认不拆分已有分组</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.aiGroup.keepExistingGroups" @change="saveConfig">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="toggle-group">
          <span class="toggle-label">不分组已固定标签页</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.aiGroup.ignorePinnedTabs" @change="saveConfig">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="toggle-group">
          <span class="toggle-label">自动折叠新分组</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.aiGroup.autoCollapseNewGroups" @change="saveConfig">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="toggle-group">
          <span class="toggle-label">只有单页不成组</span>
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.aiGroup.singleTabNoGroup" @change="saveConfig">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section {
  border-bottom: 1px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  background: #F6E5E9;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.section-header:hover {
  background: #edd8dd;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-arrow {
  transition: transform 0.3s ease;
  color: #999;
  font-size: 14px;
}

.section.collapsed .section-arrow {
  transform: rotate(-90deg);
}

.section-content {
  padding: 20px;
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.section.collapsed .section-content {
  max-height: 0;
  padding: 0 20px;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.radio-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.radio-button {
  flex: 1;
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  font-size: 14px;
  color: #666;
}

.radio-button:hover {
  border-color: #ffb3b3;
}

.radio-button.active {
  background: #fff0f0;
  border-color: #ffb3b3;
  color: #ff6b6b;
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #ffb3b3;
}

.hint-text {
  color: #bbb;
  font-size: 13px;
  margin-top: 8px;
  font-style: italic;
}

.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.toggle-label {
  font-size: 14px;
  color: #333;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 28px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #ff8a8a;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}
</style>
