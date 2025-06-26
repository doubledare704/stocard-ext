<template>
  <div class="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">PWA Install Test</h2>
    
    <!-- Installation Criteria -->
    <div class="space-y-3 mb-6">
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span class="text-sm font-medium">HTTPS</span>
        <span :class="criteria.https ? 'text-green-600' : 'text-red-600'">
          {{ criteria.https ? '✓' : '✗' }}
        </span>
      </div>
      
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span class="text-sm font-medium">Manifest</span>
        <span :class="criteria.manifest ? 'text-green-600' : 'text-red-600'">
          {{ criteria.manifest ? '✓' : '✗' }}
        </span>
      </div>
      
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span class="text-sm font-medium">Service Worker</span>
        <span :class="criteria.serviceWorker ? 'text-green-600' : 'text-red-600'">
          {{ criteria.serviceWorker ? '✓' : '✗' }}
        </span>
      </div>
      
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span class="text-sm font-medium">Install Event</span>
        <span :class="criteria.installEvent ? 'text-green-600' : 'text-red-600'">
          {{ criteria.installEvent ? '✓' : '✗' }}
        </span>
      </div>
      
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span class="text-sm font-medium">Not Installed</span>
        <span :class="criteria.notInstalled ? 'text-green-600' : 'text-red-600'">
          {{ criteria.notInstalled ? '✓' : '✗' }}
        </span>
      </div>
    </div>
    
    <!-- Overall Status -->
    <div class="mb-6 p-4 rounded-lg" :class="allCriteriaMet ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'">
      <div class="flex items-center">
        <span class="text-2xl mr-2">{{ allCriteriaMet ? '✅' : '❌' }}</span>
        <div>
          <h3 class="font-semibold" :class="allCriteriaMet ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
            {{ allCriteriaMet ? 'PWA Installable' : 'PWA Not Installable' }}
          </h3>
          <p class="text-sm" :class="allCriteriaMet ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'">
            {{ allCriteriaMet ? 'All requirements met' : 'Some requirements missing' }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Test Buttons -->
    <div class="space-y-3">
      <button
        @click="testInstallPrompt"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        :disabled="!allCriteriaMet"
      >
        Test Install Prompt
      </button>
      
      <button
        @click="recheckCriteria"
        class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Recheck Criteria
      </button>
      
      <button
        @click="showDebugInfo"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Show Debug Info
      </button>
    </div>
    
    <!-- Debug Info -->
    <div v-if="showDebug" class="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h4 class="font-semibold mb-2">Debug Information</h4>
      <div class="text-xs space-y-1">
        <div><strong>URL:</strong> {{ currentUrl }}</div>
        <div><strong>Protocol:</strong> {{ protocol }}</div>
        <div><strong>User Agent:</strong> {{ userAgent }}</div>
        <div><strong>Display Mode:</strong> {{ displayMode }}</div>
        <div><strong>Manifest URL:</strong> {{ manifestUrl }}</div>
        <div><strong>SW Registrations:</strong> {{ swRegistrations }}</div>
      </div>
    </div>
    
    <!-- Event Log -->
    <div v-if="eventLog.length > 0" class="mt-6">
      <h4 class="font-semibold mb-2">Event Log</h4>
      <div class="max-h-32 overflow-y-auto bg-gray-100 dark:bg-gray-700 rounded p-2">
        <div v-for="(event, index) in eventLog" :key="index" class="text-xs mb-1">
          <span class="text-gray-500">{{ event.time }}</span> - {{ event.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const criteria = ref({
  https: false,
  manifest: false,
  serviceWorker: false,
  installEvent: false,
  notInstalled: false
})

const showDebug = ref(false)
const eventLog = ref([])
const currentUrl = ref('')
const protocol = ref('')
const userAgent = ref('')
const displayMode = ref('')
const manifestUrl = ref('')
const swRegistrations = ref(0)
const deferredPrompt = ref(null)

// Computed
const allCriteriaMet = computed(() => {
  return Object.values(criteria.value).every(Boolean)
})

// Methods
const logEvent = (message) => {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    message
  })
  if (eventLog.value.length > 10) {
    eventLog.value.pop()
  }
}

const recheckCriteria = async () => {
  if (!process.client) return
  
  logEvent('Rechecking PWA criteria...')
  
  // Check HTTPS
  criteria.value.https = location.protocol === 'https:' || location.hostname === 'localhost'
  
  // Check manifest
  const manifestLink = document.querySelector('link[rel="manifest"]')
  criteria.value.manifest = manifestLink !== null
  manifestUrl.value = manifestLink?.href || 'Not found'
  
  // Check service worker
  criteria.value.serviceWorker = 'serviceWorker' in navigator
  if (criteria.value.serviceWorker) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      swRegistrations.value = registrations.length
      criteria.value.serviceWorker = registrations.length > 0
    } catch (error) {
      criteria.value.serviceWorker = false
      logEvent(`SW check failed: ${error.message}`)
    }
  }
  
  // Check if not installed
  criteria.value.notInstalled = !window.matchMedia('(display-mode: standalone)').matches &&
                               !window.navigator.standalone &&
                               !document.referrer.includes('android-app://')
  
  // Update debug info
  currentUrl.value = location.href
  protocol.value = location.protocol
  userAgent.value = navigator.userAgent.substring(0, 100) + '...'
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode.value = 'standalone'
  } else {
    displayMode.value = 'browser'
  }
  
  logEvent(`Criteria check completed. Installable: ${allCriteriaMet.value}`)
}

const testInstallPrompt = async () => {
  logEvent('Testing install prompt...')
  
  if (deferredPrompt.value) {
    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      logEvent(`Install prompt outcome: ${outcome}`)
      deferredPrompt.value = null
      criteria.value.installEvent = false
    } catch (error) {
      logEvent(`Install prompt error: ${error.message}`)
    }
  } else {
    logEvent('No deferred prompt available - triggering custom event')
    window.dispatchEvent(new CustomEvent('trigger-pwa-install'))
  }
}

const showDebugInfo = () => {
  showDebug.value = !showDebug.value
}

const handleBeforeInstallPrompt = (e) => {
  logEvent('beforeinstallprompt event fired!')
  e.preventDefault()
  deferredPrompt.value = e
  criteria.value.installEvent = true
}

onMounted(() => {
  if (!process.client) return
  
  // Initial check
  recheckCriteria()
  
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    logEvent('App was installed!')
    criteria.value.notInstalled = false
  })
  
  logEvent('PWA Install Test initialized')
})
</script>
