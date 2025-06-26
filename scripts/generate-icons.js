const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/icon.svg')
  const publicPath = path.join(__dirname, '../public')
  
  if (!fs.existsSync(svgPath)) {
    console.error('SVG icon not found at:', svgPath)
    return
  }
  
  const sizes = [
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' }
  ]
  
  try {
    for (const { size, name } of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(publicPath, name))
      
      console.log(`Generated ${name} (${size}x${size})`)
    }
    
    console.log('All icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
  }
}

generateIcons()
