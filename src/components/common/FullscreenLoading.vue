<script setup lang="ts">
import { useLoadingStore } from '@/composables'

const { isLoading } = useLoadingStore()
</script>

<template>
  <Transition name="loading-fade">
    <div v-if="isLoading" class="fullscreen-loading">
      <div class="loading-content">
        <div class="spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Đang tải...</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fullscreen-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-radius: 50%;
}

.spinner-ring:nth-child(1) {
  border-top-color: var(--el-color-primary, #409eff);
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  border-right-color: var(--el-color-primary-light-3, #79bbff);
  animation: spin 1.5s linear infinite reverse;
  inset: 4px;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: var(--el-color-primary-light-5, #a0cfff);
  animation: spin 2s linear infinite;
  inset: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  font-size: 14px;
  color: var(--el-color-primary, #409eff);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Transition */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.25s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
