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
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
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
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading your cards...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCards.length === 0 && !searchQuery" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No store cards yet</h3>
      <p class="mt-2 text-gray-600">Get started by adding your first loyalty card</p>
      <NuxtLink to="/add" class="mt-4 btn-primary max-w-xs mx-auto">
        Add Your First Card
      </NuxtLink>
    </div>

    <!-- No Search Results -->
    <div v-else-if="filteredCards.length === 0 && searchQuery" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No cards found</h3>
      <p class="mt-2 text-gray-600">Try adjusting your search terms</p>
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
            <h3 class="text-lg font-semibold text-gray-900">{{ card.storeName }}</h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ formatBarcodeDisplay(card.barcodeData, card.barcodeType) }}
            </p>
            <p class="text-xs text-gray-500 mt-2">
              Updated {{ formatDate(card.updatedAt) }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click.stop="editCard(card)"
              class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click.stop="confirmDelete(card)"
              class="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete Store Card</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete "{{ cardToDelete?.storeName }}"? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button @click="cancelDelete" class="btn-secondary flex-1">Cancel</button>
          <button @click="deleteCard" class="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex-1">
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
})
</script>
