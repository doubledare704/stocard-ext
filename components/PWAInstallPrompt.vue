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
      <div v-if="!deferredPrompt" class="mb-4">
        <SimpleInstallGuide />
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

const showInstallPrompt = ref(false)
const deferredPrompt = ref(null)

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

// Check if app is already installed
const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://')
}

// Check if user has already dismissed the prompt
const hasUserDismissed = () => {
  return localStorage.getItem('pwa-install-dismissed') === 'true'
}

// Handle the beforeinstallprompt event
const handleBeforeInstallPrompt = (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  
  // Save the event so it can be triggered later
  deferredPrompt.value = e
  
  // Show our custom install prompt if conditions are met
  if (!isAppInstalled() && !hasUserDismissed()) {
    // Delay showing the prompt slightly for better UX
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000) // Show after 3 seconds
  }
}

// Install the app
const installApp = async () => {
  if (deferredPrompt.value) {
    // Show the native install prompt
    deferredPrompt.value.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice

    console.log('Install prompt outcome:', outcome)

    // Clear the deferredPrompt and hide our prompt
    deferredPrompt.value = null
    showInstallPrompt.value = false
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
        document.body.removeChild(toast)
      }, 4000)
    }
  }
}

// Dismiss the prompt
const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
  
  // Allow showing again after 7 days
  setTimeout(() => {
    localStorage.removeItem('pwa-install-dismissed')
  }, 7 * 24 * 60 * 60 * 1000) // 7 days
}

// Show simple browser instructions
const showBrowserInstructions = () => {
  // Simply show the install prompt with a helpful message
  showInstallPrompt.value = true
}

// Handle app installed event
const handleAppInstalled = () => {
  console.log('PWA was installed')
  showInstallPrompt.value = false
}

// Handle custom trigger event
const handleTriggerInstall = () => {
  if (!isAppInstalled() && !hasUserDismissed()) {
    showInstallPrompt.value = true
  } else if (!deferredPrompt.value) {
    showBrowserInstructions()
  } else {
    installApp()
  }
}

onMounted(() => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', handleAppInstalled)

  // Listen for custom trigger event
  window.addEventListener('trigger-pwa-install', handleTriggerInstall)

  // For iOS devices, show prompt after some time since they don't fire beforeinstallprompt
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !isAppInstalled() && !hasUserDismissed()) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 5000) // Show after 5 seconds on iOS
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
  window.removeEventListener('trigger-pwa-install', handleTriggerInstall)
})
</script>
