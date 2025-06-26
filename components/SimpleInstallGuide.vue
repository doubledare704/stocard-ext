<template>
  <div class="text-center p-4">
    <!-- Animated Install Icon -->
    <div class="relative mb-4">
      <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-105">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      </div>
      
      <!-- Animated Arrow -->
      <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8l-8 8-8-8"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Simple Message -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Add to Home Screen
    </h3>
    
    <!-- Platform-specific hint -->
    <div class="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <span class="text-lg">{{ platformIcon }}</span>
      <span>{{ simpleHint }}</span>
    </div>

    <!-- Visual Browser Hint -->
    <div class="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
      <span>{{ browserAction }}</span>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
      <span>Install</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Simple platform detection
const isIOS = computed(() => {
  if (process.client) {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }
  return false
})

const isAndroid = computed(() => {
  if (process.client) {
    return /Android/.test(navigator.userAgent)
  }
  return false
})

const platformIcon = computed(() => {
  if (isIOS.value) return '🍎'
  if (isAndroid.value) return '🤖'
  return '💻'
})

const simpleHint = computed(() => {
  if (isIOS.value) return 'Safari Share Menu'
  if (isAndroid.value) return 'Chrome Menu'
  return 'Browser Menu'
})

const browserAction = computed(() => {
  if (isIOS.value) return 'Share'
  if (isAndroid.value) return 'Menu ⋮'
  return 'Menu'
})
</script>

<style scoped>
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0,-8px,0);
  }
  70% {
    transform: translate3d(0,-4px,0);
  }
  90% {
    transform: translate3d(0,-2px,0);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
