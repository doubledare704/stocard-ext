<template>
  <div class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Test Error Tracking</h1>
    
    <div class="space-y-4">
      <button
        @click="triggerError"
        class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        Trigger Test Error
      </button>
      
      <button
        @click="triggerAsyncError"
        class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        Trigger Async Error
      </button>
      
      <div v-if="errorSent" class="p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
        ✅ Error sent to Sentry successfully!
      </div>
    </div>
    
    <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 class="text-lg font-semibold mb-2">Instructions:</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Click the buttons above to test error tracking. Check your Sentry dashboard to see if errors are being captured.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Meta
useHead({
  title: 'Test Error Tracking - StoreCard Manager'
})

const errorSent = ref(false)

const triggerError = () => {
  try {
    errorSent.value = true
    throw new Error("Test Error from StoreCard App - Button Click")
  } catch (error) {
    console.error('Test error triggered:', error)
    // The error will be automatically captured by Sentry
  }
}

const triggerAsyncError = async () => {
  try {
    errorSent.value = true
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Test Async Error from StoreCard App"))
      }, 100)
    })
  } catch (error) {
    console.error('Test async error triggered:', error)
    // The error will be automatically captured by Sentry
  }
}
</script>
