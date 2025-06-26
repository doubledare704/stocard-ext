<template>
  <div class="space-y-6">
    <!-- Search Bar -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search store cards..."
        class="input-field pl-10"
        @input="handleSearch"
      >
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>

    <!-- Install App Banner (only show if not installed) -->
    <div v-if="!isAppInstalled" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-blue-900 dark:text-blue-100">Install App</p>
            <p class="text-xs text-blue-700 dark:text-blue-300">Add to home screen for quick access</p>
          </div>
        </div>
        <button
          @click="triggerInstall"
          class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
        >
          Install
        </button>
      </div>
    </div>

    <!-- Add New Card Button -->
    <NuxtLink to="/add" class="btn-primary">
      <div class="flex items-center justify-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <span>Add New Store Card</span>
      </div>
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading your cards...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCards.length === 0 && !searchQuery" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No store cards yet</h3>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Get started by adding your first loyalty card</p>
      <NuxtLink to="/add" class="mt-4 btn-primary max-w-xs mx-auto">
        Add Your First Card
      </NuxtLink>
    </div>

    <!-- No Search Results -->
    <div v-else-if="filteredCards.length === 0 && searchQuery" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No cards found</h3>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Try adjusting your search terms</p>
      <button @click="clearSearch" class="mt-4 btn-secondary max-w-xs mx-auto">
        Clear Search
      </button>
    </div>

    <!-- Store Cards List -->
    <div v-else class="space-y-4">
      <div
        v-for="card in filteredCards"
        :key="card.id"
        class="store-card"
        @click="viewCard(card)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">{{ card.storeName }}</h3>
            <div class="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {{ card.barcodeType === 'qr' ? '📱 QR Code' : '📊 Barcode' }}
              </p>
              <p class="text-sm sm:text-base font-mono text-gray-800 dark:text-gray-200 break-all font-medium">
                {{ card.barcodeData }}
              </p>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Updated {{ formatDate(card.updatedAt) }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click.stop="editCard(card)"
              class="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click.stop="confirmDelete(card)"
              class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Delete Store Card</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "{{ cardToDelete?.storeName }}"? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button @click="cancelDelete" class="btn-secondary flex-1">Cancel</button>
          <button @click="deleteCard" class="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex-1">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStorage } from '~/composables/useStorage'
import { useBarcodeReader } from '~/composables/useBarcodeReader'

// Meta
useHead({
  title: 'My Store Cards - StoreCard Manager'
})

// Composables
const { getAllCards, deleteCard: removeCard } = useStorage()
const { generateBarcodeDisplay } = useBarcodeReader()

// Reactive data
const cards = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showDeleteModal = ref(false)
const cardToDelete = ref(null)
const isAppInstalled = ref(false)

// Computed
const filteredCards = computed(() => {
  if (!searchQuery.value.trim()) return cards.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return cards.value.filter(card => 
    card.storeName.toLowerCase().includes(query)
  )
})

// Methods
const loadCards = async () => {
  try {
    loading.value = true
    cards.value = await getAllCards()
  } catch (error) {
    console.error('Error loading cards:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const viewCard = (card) => {
  navigateTo(`/card/${card.id}`)
}

const editCard = (card) => {
  navigateTo(`/add?edit=${card.id}`)
}

const confirmDelete = (card) => {
  cardToDelete.value = card
  showDeleteModal.value = true
}

const cancelDelete = () => {
  cardToDelete.value = null
  showDeleteModal.value = false
}

const deleteCard = async () => {
  if (!cardToDelete.value) return
  
  try {
    await removeCard(cardToDelete.value.id)
    await loadCards() // Reload cards
    cancelDelete()
  } catch (error) {
    console.error('Error deleting card:', error)
    alert('Failed to delete card. Please try again.')
  }
}

const formatBarcodeDisplay = (data, type) => {
  return generateBarcodeDisplay(data, type)
}

// PWA Install functionality
const checkIfAppInstalled = () => {
  if (process.client) {
    isAppInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://')
  }
}

const triggerInstall = () => {
  // This will trigger the PWAInstallPrompt component
  window.dispatchEvent(new CustomEvent('trigger-pwa-install'))
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'today'
  if (diffDays === 2) return 'yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadCards()
  checkIfAppInstalled()
})
</script>
