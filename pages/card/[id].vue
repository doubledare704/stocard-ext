<template>
  <div v-if="loading" class="text-center py-8">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
    <p class="mt-2 text-gray-600 dark:text-gray-400">Loading card...</p>
  </div>

  <div v-else-if="!card" class="text-center py-12">
    <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
    </svg>
    <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Card not found</h3>
    <p class="mt-2 text-gray-600 dark:text-gray-400">The store card you're looking for doesn't exist</p>
    <NuxtLink to="/" class="mt-4 btn-primary max-w-xs mx-auto">
      Back to Cards
    </NuxtLink>
  </div>

  <div v-else class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </NuxtLink>
      <div class="flex space-x-2">
        <NuxtLink :to="`/add?edit=${card.id}`" class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Store Card Display -->
    <div class="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-xl p-6 text-white shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">{{ card.storeName }}</h1>
        <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      </div>
      
      <!-- Barcode Display Area -->
      <div class="bg-white rounded-lg p-6 text-center">
        <div class="text-gray-900">
          <!-- QR Code visualization -->
          <div v-if="card.barcodeType === 'qr'" class="mb-6">
            <div class="text-lg font-semibold text-gray-700 mb-4">QR Code</div>
            <!-- Large QR code placeholder -->
            <div class="qr-visual mx-auto mb-4 bg-gray-900 rounded-lg p-6 max-w-xs">
              <div class="grid grid-cols-8 gap-1">
                <div v-for="n in 64" :key="n"
                     class="aspect-square rounded-sm"
                     :class="Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'">
                </div>
              </div>
            </div>
            <!-- Large, readable barcode data -->
            <div class="barcode-display bg-gray-100 text-gray-900 p-6 rounded-lg font-mono text-lg sm:text-xl break-all border-2 border-dashed border-gray-300 select-all cursor-pointer hover:bg-gray-200 transition-colors"
                 @click="copyToClipboard(card.barcodeData)"
                 title="Tap to copy">
              {{ card.barcodeData }}
            </div>
          </div>

          <!-- Traditional Barcode visualization -->
          <div v-else class="mb-6">
            <div class="text-lg font-semibold text-gray-700 mb-4">Barcode</div>
            <!-- Much larger barcode representation -->
            <div class="barcode-visual flex justify-center mb-4 p-6 bg-gray-50 rounded-lg">
              <div class="flex space-x-px">
                <div v-for="n in 40" :key="n"
                     class="bg-gray-900"
                     :style="{
                       width: Math.random() > 0.6 ? '4px' : Math.random() > 0.3 ? '3px' : '5px',
                       height: '140px'
                     }">
                </div>
              </div>
            </div>
            <!-- Large, readable barcode number -->
            <div class="barcode-display font-mono text-xl sm:text-3xl font-bold text-gray-900 bg-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-300 select-all cursor-pointer hover:bg-gray-200 transition-colors"
                 @click="copyToClipboard(card.barcodeData)"
                 title="Tap to copy">
              {{ card.barcodeData }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 text-sm opacity-80">
        <p>Created {{ formatDate(card.createdAt) }}</p>
        <p v-if="card.updatedAt !== card.createdAt">
          Updated {{ formatDate(card.updatedAt) }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-3">
      <!-- Copy Barcode Data -->
      <button
        @click="copyBarcodeData"
        class="btn-secondary"
        :class="{ 'bg-green-100 text-green-800': copied }"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>{{ copied ? 'Copied!' : 'Copy Barcode Data' }}</span>
        </div>
      </button>

      <!-- Brightness Control -->
      <div class="card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Screen Brightness</label>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ Math.round(brightness * 100) }}%</span>
        </div>
        <input
          v-model="brightness"
          type="range"
          min="0.3"
          max="1"
          step="0.1"
          class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          @input="adjustBrightness"
        >
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Increase brightness for better barcode scanning
        </p>
      </div>

      <!-- Full Screen Mode -->
      <button
        @click="toggleFullscreen"
        class="btn-secondary"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
          </svg>
          <span>{{ isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen' }}</span>
        </div>
      </button>
    </div>

    <!-- Card Info -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Card Information</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Store Name:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ card.storeName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Barcode Type:</span>
          <span class="font-medium capitalize text-gray-900 dark:text-gray-100">{{ card.barcodeType }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Data Length:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ card.barcodeData.length }} characters</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Created:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(card.createdAt) }}</span>
        </div>
        <div v-if="card.updatedAt !== card.createdAt" class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(card.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStorage } from '~/composables/useStorage'

// Meta
useHead({
  title: 'Store Card - StoreCard Manager'
})

// Composables
const { getCard } = useStorage()
const route = useRoute()

// Reactive data
const card = ref(null)
const loading = ref(true)
const copied = ref(false)
const brightness = ref(1)
const isFullscreen = ref(false)

// Methods
const loadCard = async () => {
  try {
    loading.value = true
    const cardId = route.params.id
    card.value = await getCard(cardId)
    
    if (card.value) {
      useHead({
        title: `${card.value.storeName} - StoreCard Manager`
      })
    }
  } catch (error) {
    console.error('Error loading card:', error)
  } finally {
    loading.value = false
  }
}

const copyBarcodeData = async () => {
  try {
    await navigator.clipboard.writeText(card.value.barcodeData)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = card.value.barcodeData
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// Alternative copy function for direct click on barcode
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const adjustBrightness = () => {
  document.documentElement.style.filter = `brightness(${brightness.value})`
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadCard()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  // Reset brightness when leaving the page
  document.documentElement.style.filter = ''
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>
