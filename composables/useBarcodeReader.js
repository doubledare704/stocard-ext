import jsQR from 'jsqr'
import Quagga from 'quagga'

export const useBarcodeReader = () => {
  // Read QR code from image data
  const readQRCode = (imageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      return code ? { data: code.data, type: 'qr' } : null
    } catch (error) {
      console.error('Error reading QR code:', error)
      return null
    }
  }

  // Read barcode from image using Quagga
  const readBarcode = async (imageElement) => {
    return new Promise((resolve) => {
      try {
        // Create a canvas to work with the image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = imageElement.width || imageElement.naturalWidth
        canvas.height = imageElement.height || imageElement.naturalHeight
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

        // Configure Quagga for barcode detection
        Quagga.decodeSingle({
          decoder: {
            readers: [
              'code_128_reader',
              'ean_reader',
              'ean_8_reader',
              'code_39_reader',
              'code_39_vin_reader',
              'codabar_reader',
              'upc_reader',
              'upc_e_reader',
              'i2of5_reader'
            ]
          },
          locate: true,
          src: canvas.toDataURL()
        }, (result) => {
          if (result && result.codeResult) {
            resolve({ data: result.codeResult.code, type: 'barcode' })
          } else {
            resolve(null)
          }
        })
      } catch (error) {
        console.error('Error reading barcode:', error)
        resolve(null)
      }
    })
  }

  // Process image file and extract barcode/QR code
  const processImageFile = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid file type. Please select an image file.'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Set canvas size to image size
          canvas.width = img.width
          canvas.height = img.height

          // Draw image to canvas
          ctx.drawImage(img, 0, 0)

          // Get image data for QR code detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          // Try QR code first
          const qrResult = readQRCode(imageData)
          if (qrResult) {
            console.log('QR code detected:', qrResult.data)
            resolve(qrResult)
            return
          }

          // If no QR code found, try barcode reading
          try {
            const barcodeResult = await readBarcode(img)
            if (barcodeResult) {
              console.log('Barcode detected:', barcodeResult.data)
              resolve(barcodeResult)
            } else {
              console.log('No barcode or QR code detected in image')
              resolve(null)
            }
          } catch (error) {
            console.error('Error during barcode detection:', error)
            resolve(null)
          }
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }
        
        img.src = e.target.result
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  // Process pasted image data
  const processPastedImage = async (clipboardData) => {
    const items = Array.from(clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))
    
    if (!imageItem) {
      throw new Error('No image found in clipboard')
    }
    
    const file = imageItem.getAsFile()
    return await processImageFile(file)
  }

  // Validate barcode data
  const validateBarcodeData = (data, type = 'manual') => {
    if (!data || typeof data !== 'string') {
      return { isValid: false, error: 'Barcode data is required' }
    }
    
    const trimmedData = data.trim()
    if (trimmedData.length === 0) {
      return { isValid: false, error: 'Barcode data cannot be empty' }
    }
    
    // Basic validation based on type
    switch (type) {
      case 'manual':
        // Allow any non-empty string for manual entry
        if (trimmedData.length < 3) {
          return { isValid: false, error: 'Barcode must be at least 3 characters long' }
        }
        break
      case 'qr':
        // QR codes can contain various data formats
        break
      case 'barcode':
        // Traditional barcodes are usually numeric
        if (!/^[0-9]+$/.test(trimmedData)) {
          return { isValid: false, error: 'Traditional barcodes should contain only numbers' }
        }
        break
    }
    
    return { isValid: true, data: trimmedData }
  }

  // Generate a simple barcode representation (for display purposes)
  const generateBarcodeDisplay = (data, type = 'manual') => {
    if (!data) return ''
    
    switch (type) {
      case 'qr':
        return `QR: ${data}`
      case 'barcode':
        return `Barcode: ${data}`
      default:
        return data
    }
  }

  return {
    readQRCode,
    readBarcode,
    processImageFile,
    processPastedImage,
    validateBarcodeData,
    generateBarcodeDisplay
  }
}
