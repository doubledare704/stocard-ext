<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <!-- Header with App Icon -->
      <div class="text-center mb-4">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
          Install StoreCard
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Quick access to your loyalty cards
        </p>
      </div>

      <!-- Simple Visual Guide -->
      <div v-if="!deferredPrompt" class="mb-4 text-center">
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

        <!-- Platform-specific hint -->
        <div class="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span class="text-lg">{{ browserIcon }}</span>
          <span>{{ browserHint }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="installApp"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          {{ deferredPrompt ? '📱 Install Now' : '📱 Show Me How' }}
        </button>
        <button
          @click="dismissPrompt"
          class="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium py-2 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePWAInstall } from '~/composables/usePWAInstall'

const showInstallPrompt = ref(false)
const {
  deferredPrompt,
  isInstallable,
  isAppInstalled,
  triggerInstall: triggerNativeInstall,
  dismissInstall,
  initPWAInstall,
  cleanupPWAInstall
} = usePWAInstall()

// Simple browser detection and hints
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

const browserIcon = computed(() => {
  if (isIOS.value) return '🍎'
  if (isAndroid.value) return '🤖'
  return '💻'
})

const browserHint = computed(() => {
  if (isIOS.value) return 'Share → Add to Home'
  if (isAndroid.value) return 'Menu → Install'
  return 'Browser Menu → Install'
})

// Check if user has already dismissed the prompt
const hasUserDismissed = () => {
  return localStorage.getItem('pwa-install-dismissed') === 'true'
}

// Install the app
const installApp = async () => {
  if (deferredPrompt.value) {
    // Use the composable's install function
    const success = await triggerNativeInstall()
    if (success) {
      showInstallPrompt.value = false
    }
  } else {
    // For browsers without native prompt support (like iOS Safari)
    // Just dismiss our prompt - the user will use browser's native method
    showInstallPrompt.value = false

    // Show a simple toast-like message
    if (process.client) {
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 left-4 right-4 z-50 max-w-md mx-auto bg-blue-600 text-white p-3 rounded-lg shadow-lg text-center text-sm'
      toast.textContent = `${browserHint.value} to install this app`
      document.body.appendChild(toast)

      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 4000)
    }
  }
}

// Dismiss the prompt
const dismissPrompt = () => {
  showInstallPrompt.value = false
  dismissInstall()
}

// Handle custom trigger event
const handleTriggerInstall = () => {
  if (!isAppInstalled.value && !hasUserDismissed()) {
    showInstallPrompt.value = true
  } else if (!deferredPrompt.value) {
    showInstallPrompt.value = true
  } else {
    installApp()
  }
}

onMounted(() => {
  // Initialize PWA install detection
  initPWAInstall()

  // Listen for custom trigger event
  window.addEventListener('trigger-pwa-install', handleTriggerInstall)

  // Listen for custom show prompt event
  window.addEventListener('show-pwa-install-prompt', () => {
    if (!isAppInstalled.value && !hasUserDismissed()) {
      showInstallPrompt.value = true
    }
  })

  // For iOS devices, show prompt after some time since they don't fire beforeinstallprompt
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !isAppInstalled.value && !hasUserDismissed()) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 5000) // Show after 5 seconds on iOS
  }
})

onUnmounted(() => {
  cleanupPWAInstall()
  window.removeEventListener('trigger-pwa-install', handleTriggerInstall)
  window.removeEventListener('show-pwa-install-prompt', () => {})
})
</script>
