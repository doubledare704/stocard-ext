<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ isEditing ? 'Edit Store Card' : 'Add Store Card' }}
      </h1>
      <NuxtLink to="/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </NuxtLink>
    </div>

    <!-- Form -->
    <form @submit.prevent="saveCard" class="space-y-6">
      <!-- Store Name -->
      <div>
        <label for="storeName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Store Name *
        </label>
        <input
          id="storeName"
          v-model="form.storeName"
          type="text"
          required
          placeholder="e.g., Starbucks, Target, CVS"
          class="input-field"
          :class="{ 'border-red-500 dark:border-red-400': errors.storeName }"
        >
        <p v-if="errors.storeName" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.storeName }}</p>
      </div>

      <!-- Barcode Input Methods -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Add Barcode/QR Code *
        </label>
        
        <!-- Input Method Tabs -->
        <div class="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
          <button
            type="button"
            @click="inputMethod = 'manual'"
            class="py-2 px-3 rounded-md text-sm font-medium transition-colors"
            :class="inputMethod === 'manual' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
          >
            Type
          </button>
          <button
            type="button"
            @click="inputMethod = 'upload'"
            class="py-2 px-3 rounded-md text-sm font-medium transition-colors"
            :class="inputMethod === 'upload' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
          >
            Upload
          </button>
          <button
            type="button"
            @click="inputMethod = 'paste'"
            class="py-2 px-3 rounded-md text-sm font-medium transition-colors"
            :class="inputMethod === 'paste' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
          >
            Paste
          </button>
          <button
            type="button"
            @click="inputMethod = 'camera'"
            class="py-2 px-3 rounded-md text-sm font-medium transition-colors"
            :class="inputMethod === 'camera' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'"
          >
            Camera
          </button>
        </div>

        <!-- Manual Input -->
        <div v-if="inputMethod === 'manual'" class="space-y-3">
          <input
            v-model="form.barcodeData"
            type="text"
            placeholder="Enter barcode numbers or text"
            class="input-field"
            :class="{ 'border-red-500 dark:border-red-400': errors.barcodeData }"
          >
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter the numbers or text from your loyalty card barcode
          </p>
        </div>

        <!-- File Upload -->
        <div v-if="inputMethod === 'upload'" class="space-y-3">
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
            >
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <button type="button" @click="$refs.fileInput.click()" class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                Click to upload
              </button>
              or drag and drop
            </p>
            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
          <div v-if="uploadStatus" class="text-sm" :class="uploadStatus.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
            {{ uploadStatus.message }}
          </div>
        </div>

        <!-- Paste Image -->
        <div v-if="inputMethod === 'paste'" class="space-y-3">
          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center"
            @paste="handlePaste"
            tabindex="0"
          >
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Click here and paste (Ctrl+V) an image from your clipboard
            </p>
            <p class="text-xs text-gray-500">Copy an image and paste it here</p>
          </div>
          <div v-if="pasteStatus" class="text-sm" :class="pasteStatus.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
            {{ pasteStatus.message }}
          </div>
        </div>

        <!-- Camera Capture -->
        <div v-if="inputMethod === 'camera'" class="space-y-3">
          <!-- Camera not supported -->
          <div v-if="!cameraSupported" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Camera not supported on this device
            </p>
            <p class="text-xs text-gray-500">Try using the Upload or Paste options instead</p>
          </div>

          <!-- Camera interface -->
          <div v-else class="space-y-4">
            <!-- Camera preview -->
            <div v-if="!cameraActive" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                Take a photo of your barcode or QR code
              </p>
              <button
                type="button"
                @click="startCameraCapture"
                class="btn-primary max-w-xs mx-auto"
                :disabled="cameraLoading"
              >
                <span v-if="cameraLoading">Starting Camera...</span>
                <span v-else>Start Camera</span>
              </button>
            </div>

            <!-- Active camera view -->
            <div v-else class="relative">
              <video
                ref="videoElement"
                autoplay
                playsinline
                muted
                class="w-full h-64 bg-black rounded-lg object-cover"
              ></video>

              <!-- Camera controls overlay -->
              <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button
                  type="button"
                  @click="captureImage"
                  class="bg-white hover:bg-gray-100 text-gray-900 p-4 rounded-full shadow-lg transition-colors"
                  :disabled="capturing"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>

                <button
                  type="button"
                  @click="switchCameraFacing"
                  class="bg-white hover:bg-gray-100 text-gray-900 p-4 rounded-full shadow-lg transition-colors"
                  v-if="canSwitchCamera"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>

                <button
                  type="button"
                  @click="stopCameraCapture"
                  class="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="cameraStatus" class="text-sm" :class="cameraStatus.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
            {{ cameraStatus.message }}
          </div>
        </div>

        <!-- Current Barcode Data -->
        <div v-if="form.barcodeData" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p class="text-sm font-medium text-green-800 dark:text-green-400">Barcode Data:</p>
          <p class="text-sm text-green-700 dark:text-green-300 font-mono break-all">{{ form.barcodeData }}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">Type: {{ form.barcodeType }}</p>
        </div>

        <p v-if="errors.barcodeData" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.barcodeData }}</p>
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <button
          type="submit"
          :disabled="saving"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': saving }"
        >
          <span v-if="saving">
            <svg class="inline w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isEditing ? 'Updating...' : 'Saving...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Update Card' : 'Save Card' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useStorage } from '~/composables/useStorage'
import { useBarcodeReader } from '~/composables/useBarcodeReader'

// Meta
useHead({
  title: 'Add Store Card - StoreCard Manager'
})

// Composables
const { saveCard: saveStoreCard, updateCard, getCard } = useStorage()
const { processImageFile, processPastedImage, validateBarcodeData } = useBarcodeReader()
const { isSupported: cameraSupported, isActive: cameraActive, startCamera, stopCamera, capturePhoto, switchCamera, getAvailableCameras } = useCamera()
const route = useRoute()
const router = useRouter()

// Reactive data
const isEditing = ref(false)
const editingId = ref(null)
const inputMethod = ref('manual')
const saving = ref(false)
const uploadStatus = ref(null)
const pasteStatus = ref(null)
const cameraStatus = ref(null)
const cameraLoading = ref(false)
const capturing = ref(false)
const canSwitchCamera = ref(false)
const currentFacingMode = ref('environment')
const videoElement = ref(null)

const form = reactive({
  storeName: '',
  barcodeData: '',
  barcodeType: 'manual'
})

const errors = reactive({
  storeName: '',
  barcodeData: ''
})

// Methods
const validateForm = () => {
  // Reset errors
  errors.storeName = ''
  errors.barcodeData = ''
  
  let isValid = true
  
  // Validate store name
  if (!form.storeName.trim()) {
    errors.storeName = 'Store name is required'
    isValid = false
  }
  
  // Validate barcode data
  const barcodeValidation = validateBarcodeData(form.barcodeData, form.barcodeType)
  if (!barcodeValidation.isValid) {
    errors.barcodeData = barcodeValidation.error
    isValid = false
  }
  
  return isValid
}

const saveCard = async () => {
  if (!validateForm()) return
  
  try {
    saving.value = true
    
    const cardData = {
      storeName: form.storeName.trim(),
      barcodeData: form.barcodeData.trim(),
      barcodeType: form.barcodeType
    }
    
    if (isEditing.value) {
      await updateCard(editingId.value, cardData)
    } else {
      await saveStoreCard(cardData)
    }
    
    router.push('/')
  } catch (error) {
    console.error('Error saving card:', error)
    alert('Failed to save card. Please try again.')
  } finally {
    saving.value = false
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    uploadStatus.value = { type: 'info', message: 'Processing image...' }
    
    const result = await processImageFile(file)
    if (result) {
      form.barcodeData = result.data
      form.barcodeType = result.type
      uploadStatus.value = { type: 'success', message: 'Barcode detected successfully!' }
    } else {
      uploadStatus.value = { type: 'error', message: 'No barcode or QR code found in the image' }
    }
  } catch (error) {
    console.error('Error processing file:', error)
    uploadStatus.value = { type: 'error', message: error.message || 'Failed to process image' }
  }
}

const handlePaste = async (event) => {
  try {
    pasteStatus.value = { type: 'info', message: 'Processing pasted image...' }

    const result = await processPastedImage(event.clipboardData)
    if (result) {
      form.barcodeData = result.data
      form.barcodeType = result.type
      pasteStatus.value = { type: 'success', message: 'Barcode detected successfully!' }
    } else {
      pasteStatus.value = { type: 'error', message: 'No barcode or QR code found in the pasted image' }
    }
  } catch (error) {
    console.error('Error processing pasted image:', error)
    pasteStatus.value = { type: 'error', message: error.message || 'Failed to process pasted image' }
  }
}

// Camera methods
const startCameraCapture = async () => {
  try {
    cameraLoading.value = true
    cameraStatus.value = { type: 'info', message: 'Starting camera...' }

    const stream = await startCamera({ video: { facingMode: currentFacingMode.value } })

    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }

    // Check if device has multiple cameras
    const cameras = await getAvailableCameras()
    canSwitchCamera.value = cameras.length > 1

    cameraStatus.value = { type: 'success', message: 'Camera started successfully!' }
  } catch (error) {
    console.error('Error starting camera:', error)
    cameraStatus.value = { type: 'error', message: error.message || 'Failed to start camera' }
  } finally {
    cameraLoading.value = false
  }
}

const stopCameraCapture = () => {
  stopCamera()
  cameraStatus.value = null
}

const captureImage = async () => {
  try {
    capturing.value = true
    cameraStatus.value = { type: 'info', message: 'Capturing image...' }

    const photoBlob = await capturePhoto(videoElement.value)

    // Convert blob to file for processing
    const file = new File([photoBlob], 'camera-capture.jpg', { type: 'image/jpeg' })

    // Process the captured image
    const result = await processImageFile(file)
    if (result) {
      form.barcodeData = result.data
      form.barcodeType = result.type
      cameraStatus.value = { type: 'success', message: 'Barcode detected successfully!' }

      // Stop camera after successful capture
      stopCameraCapture()
    } else {
      cameraStatus.value = { type: 'error', message: 'No barcode or QR code found in the captured image' }
    }
  } catch (error) {
    console.error('Error capturing image:', error)
    cameraStatus.value = { type: 'error', message: error.message || 'Failed to capture image' }
  } finally {
    capturing.value = false
  }
}

const switchCameraFacing = async () => {
  try {
    cameraStatus.value = { type: 'info', message: 'Switching camera...' }

    const newFacingMode = await switchCamera(currentFacingMode.value)
    currentFacingMode.value = newFacingMode

    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
    }

    cameraStatus.value = { type: 'success', message: 'Camera switched successfully!' }
  } catch (error) {
    console.error('Error switching camera:', error)
    cameraStatus.value = { type: 'error', message: error.message || 'Failed to switch camera' }
  }
}

const loadCardForEditing = async (id) => {
  try {
    const card = await getCard(id)
    if (card) {
      form.storeName = card.storeName
      form.barcodeData = card.barcodeData
      form.barcodeType = card.barcodeType
      isEditing.value = true
      editingId.value = id
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Error loading card for editing:', error)
    router.push('/')
  }
}

// Lifecycle
onMounted(() => {
  const editId = route.query.edit
  if (editId) {
    loadCardForEditing(editId)
  }
})

onUnmounted(() => {
  // Clean up camera when leaving the page
  stopCameraCapture()
})
</script>
