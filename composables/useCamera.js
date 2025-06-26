export const useCamera = () => {
  const isSupported = ref(false)
  const isActive = ref(false)
  const stream = ref(null)
  const error = ref(null)
  
  // Check if camera is supported
  const checkSupport = () => {
    if (process.client) {
      isSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }
    return isSupported.value
  }
  
  // Start camera stream
  const startCamera = async (constraints = { video: { facingMode: 'environment' } }) => {
    if (!checkSupport()) {
      throw new Error('Camera not supported on this device')
    }
    
    try {
      error.value = null
      stream.value = await navigator.mediaDevices.getUserMedia(constraints)
      isActive.value = true
      return stream.value
    } catch (err) {
      error.value = err
      isActive.value = false
      
      // Provide user-friendly error messages
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Please allow camera permissions and try again.')
      } else if (err.name === 'NotFoundError') {
        throw new Error('No camera found on this device.')
      } else if (err.name === 'NotReadableError') {
        throw new Error('Camera is already in use by another application.')
      } else {
        throw new Error('Failed to access camera: ' + err.message)
      }
    }
  }
  
  // Stop camera stream
  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => {
        track.stop()
      })
      stream.value = null
    }
    isActive.value = false
    error.value = null
  }
  
  // Capture photo from video element
  const capturePhoto = (videoElement) => {
    return new Promise((resolve, reject) => {
      if (!videoElement || !isActive.value) {
        reject(new Error('Camera not active or video element not found'))
        return
      }
      
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas size to match video
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        // Draw current video frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to capture photo'))
          }
        }, 'image/jpeg', 0.9)
      } catch (err) {
        reject(new Error('Failed to capture photo: ' + err.message))
      }
    })
  }
  
  // Switch camera (front/back)
  const switchCamera = async (currentFacingMode) => {
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment'
    
    // Stop current stream
    stopCamera()
    
    // Start with new facing mode
    try {
      await startCamera({ video: { facingMode: newFacingMode } })
      return newFacingMode
    } catch (err) {
      // If switching fails, try to restart with original mode
      try {
        await startCamera({ video: { facingMode: currentFacingMode } })
        throw new Error('Failed to switch camera. Using original camera.')
      } catch (restartErr) {
        throw new Error('Failed to switch camera and restart original camera.')
      }
    }
  }
  
  // Get available cameras
  const getAvailableCameras = async () => {
    if (!checkSupport()) {
      return []
    }
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'videoinput')
    } catch (err) {
      console.error('Failed to get available cameras:', err)
      return []
    }
  }
  
  // Cleanup on unmount
  const cleanup = () => {
    stopCamera()
  }
  
  // Initialize support check
  onMounted(() => {
    checkSupport()
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    isSupported: readonly(isSupported),
    isActive: readonly(isActive),
    stream: readonly(stream),
    error: readonly(error),
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    getAvailableCameras,
    cleanup
  }
}
