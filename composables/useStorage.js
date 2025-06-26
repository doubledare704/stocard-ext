import { get, set, del, keys, clear } from 'idb-keyval'

export const useStorage = () => {
  // Store card data structure
  const createStoreCard = (data) => ({
    id: data.id || Date.now().toString(),
    storeName: data.storeName || '',
    barcodeData: data.barcodeData || '',
    barcodeType: data.barcodeType || 'manual', // 'manual', 'qr', 'barcode'
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data
  })

  // Get all store cards
  const getAllCards = async () => {
    try {
      const cardKeys = await keys()
      const storeCardKeys = cardKeys.filter(key => key.toString().startsWith('storecard_'))
      
      const cards = await Promise.all(
        storeCardKeys.map(async (key) => {
          const card = await get(key)
          return card
        })
      )
      
      return cards.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } catch (error) {
      console.error('Error getting all cards:', error)
      return []
    }
  }

  // Get a specific store card
  const getCard = async (id) => {
    try {
      return await get(`storecard_${id}`)
    } catch (error) {
      console.error('Error getting card:', error)
      return null
    }
  }

  // Save a store card
  const saveCard = async (cardData) => {
    try {
      const card = createStoreCard(cardData)
      await set(`storecard_${card.id}`, card)
      return card
    } catch (error) {
      console.error('Error saving card:', error)
      throw error
    }
  }

  // Update a store card
  const updateCard = async (id, updates) => {
    try {
      const existingCard = await getCard(id)
      if (!existingCard) {
        throw new Error('Card not found')
      }
      
      const updatedCard = {
        ...existingCard,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await set(`storecard_${id}`, updatedCard)
      return updatedCard
    } catch (error) {
      console.error('Error updating card:', error)
      throw error
    }
  }

  // Delete a store card
  const deleteCard = async (id) => {
    try {
      await del(`storecard_${id}`)
      return true
    } catch (error) {
      console.error('Error deleting card:', error)
      throw error
    }
  }

  // Clear all store cards
  const clearAllCards = async () => {
    try {
      const cardKeys = await keys()
      const storeCardKeys = cardKeys.filter(key => key.toString().startsWith('storecard_'))
      
      await Promise.all(storeCardKeys.map(key => del(key)))
      return true
    } catch (error) {
      console.error('Error clearing all cards:', error)
      throw error
    }
  }

  // Search cards by store name
  const searchCards = async (query) => {
    try {
      const allCards = await getAllCards()
      const searchTerm = query.toLowerCase().trim()
      
      if (!searchTerm) return allCards
      
      return allCards.filter(card => 
        card.storeName.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error('Error searching cards:', error)
      return []
    }
  }

  return {
    getAllCards,
    getCard,
    saveCard,
    updateCard,
    deleteCard,
    clearAllCards,
    searchCards,
    createStoreCard
  }
}
