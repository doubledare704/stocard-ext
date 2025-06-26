<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Install StoreCard App
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Add to your home screen for quick access to your store cards
          </p>
        </div>
        
        <button
          @click="dismissPrompt"
          class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="mt-4 flex space-x-2">
        <button
          @click="installApp"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          Install
        </button>
        <button
          @click="dismissPrompt"
          class="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showInstallPrompt = ref(false)
const deferredPrompt = ref(null)

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
  if (!deferredPrompt.value) {
    // Fallback: show browser-specific instructions
    showBrowserInstructions()
    return
  }
  
  // Show the install prompt
  deferredPrompt.value.prompt()
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt')
  } else {
    console.log('User dismissed the install prompt')
  }
  
  // Clear the deferredPrompt
  deferredPrompt.value = null
  showInstallPrompt.value = false
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

// Show browser-specific instructions
const showBrowserInstructions = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  
  let message = 'To install this app:\n\n'
  
  if (isIOS) {
    message += '1. Tap the Share button (square with arrow)\n'
    message += '2. Scroll down and tap "Add to Home Screen"\n'
    message += '3. Tap "Add" to confirm'
  } else if (isAndroid) {
    message += '1. Tap the menu button (three dots)\n'
    message += '2. Tap "Add to Home screen" or "Install app"\n'
    message += '3. Tap "Add" to confirm'
  } else {
    message += '1. Click the install icon in your browser\'s address bar\n'
    message += '2. Or use your browser\'s menu to "Install" or "Add to Home Screen"'
  }
  
  alert(message)
  dismissPrompt()
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
