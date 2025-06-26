<template>
  <div class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">PWA Installation Test</h1>
    
    <div class="space-y-4">
      <!-- Installation Status -->
      <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Installation Status</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>App Installed:</span>
            <span :class="isAppInstalled ? 'text-green-600' : 'text-red-600'">
              {{ isAppInstalled ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span>Install Prompt Available:</span>
            <span :class="installPromptAvailable ? 'text-green-600' : 'text-red-600'">
              {{ installPromptAvailable ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span>HTTPS:</span>
            <span :class="isHttps ? 'text-green-600' : 'text-red-600'">
              {{ isHttps ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span>Service Worker:</span>
            <span :class="hasServiceWorker ? 'text-green-600' : 'text-red-600'">
              {{ hasServiceWorker ? 'Registered' : 'Not Found' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Manual Install Button -->
      <button
        @click="triggerInstall"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        :disabled="isAppInstalled"
      >
        {{ isAppInstalled ? 'App Already Installed' : 'Install App' }}
      </button>

      <!-- Show Install Prompt Button -->
      <button
        @click="showInstallPrompt"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        Show Install Prompt
      </button>

      <!-- Browser Info -->
      <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Browser Info</h2>
        <div class="space-y-1 text-sm">
          <div><strong>User Agent:</strong> {{ userAgent }}</div>
          <div><strong>Platform:</strong> {{ platform }}</div>
          <div><strong>Display Mode:</strong> {{ displayMode }}</div>
        </div>
      </div>

      <!-- Simple Install Hint -->
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
        <div class="text-2xl mb-2">{{ platformIcon }}</div>
        <h2 class="text-lg font-semibold mb-1">{{ platformName }}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ installHint }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Meta
useHead({
  title: 'PWA Test - StoreCard Manager'
})

// Reactive data
const isAppInstalled = ref(false)
const installPromptAvailable = ref(false)
const isHttps = ref(false)
const hasServiceWorker = ref(false)
const userAgent = ref('')
const platform = ref('')
const displayMode = ref('')
const deferredPrompt = ref(null)

// Computed
const isIOS = computed(() => /iPad|iPhone|iPod/.test(userAgent.value))
const isAndroid = computed(() => /Android/.test(userAgent.value))

const platformIcon = computed(() => {
  if (isIOS.value) return '🍎'
  if (isAndroid.value) return '🤖'
  return '💻'
})

const platformName = computed(() => {
  if (isIOS.value) return 'iOS Device'
  if (isAndroid.value) return 'Android Device'
  return 'Desktop Browser'
})

const installHint = computed(() => {
  if (isIOS.value) return 'Use Share → Add to Home Screen'
  if (isAndroid.value) return 'Use Menu → Install App'
  return 'Look for install icon in address bar'
})

// Methods
const checkInstallationStatus = () => {
  if (process.client) {
    // Check if app is installed
    isAppInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://')
    
    // Check HTTPS
    isHttps.value = location.protocol === 'https:'
    
    // Check Service Worker
    hasServiceWorker.value = 'serviceWorker' in navigator
    
    // Get browser info
    userAgent.value = navigator.userAgent
    platform.value = navigator.platform
    
    // Get display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      displayMode.value = 'standalone'
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      displayMode.value = 'minimal-ui'
    } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
      displayMode.value = 'fullscreen'
    } else {
      displayMode.value = 'browser'
    }
  }
}

const handleBeforeInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  installPromptAvailable.value = true
}

const triggerInstall = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    console.log('Install prompt outcome:', outcome)
    deferredPrompt.value = null
    installPromptAvailable.value = false
  } else {
    // Show simple message instead of alert
    const message = document.createElement('div')
    message.className = 'fixed top-4 left-4 right-4 z-50 max-w-md mx-auto bg-blue-600 text-white p-3 rounded-lg shadow-lg text-center text-sm'
    message.textContent = `${installHint.value} to install this app`
    document.body.appendChild(message)
    
    setTimeout(() => {
      if (document.body.contains(message)) {
        document.body.removeChild(message)
      }
    }, 4000)
  }
}

const showInstallPrompt = () => {
  window.dispatchEvent(new CustomEvent('trigger-pwa-install'))
}

onMounted(() => {
  checkInstallationStatus()
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Check service worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      hasServiceWorker.value = registrations.length > 0
    })
  }
})
</script>
