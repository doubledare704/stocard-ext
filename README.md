# StoreCard Manager - PWA

A Progressive Web App for managing store loyalty cards and barcodes, built with Nuxt.js 3.

## Features

### Core Functionality
- **Store Card Management**: Add, edit, delete, and view store loyalty cards
- **Multiple Barcode Input Methods**:
  - Manual typing of barcode numbers
  - Upload barcode/QR code images from files
  - Paste barcode/QR code images from clipboard
- **Offline Storage**: All data stored locally using IndexedDB
- **Search**: Find cards by store name
- **Mobile-First Design**: Optimized for phone screens with large, touch-friendly buttons

### PWA Features
- **Offline Functionality**: Works completely offline once installed
- **Installable**: Can be installed as a native app on mobile devices
- **Service Worker**: Caches resources for offline use
- **App Manifest**: Proper PWA configuration with icons and metadata

### Technical Features
- **Barcode/QR Code Reading**: Automatic detection from uploaded or pasted images
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Data Persistence**: Local storage using IndexedDB via idb-keyval
- **Modern UI**: Clean, intuitive interface optimized for mobile use

## Technology Stack

- **Framework**: Nuxt.js 3.17.5
- **Frontend**: Vue.js 3.5.17
- **Styling**: Tailwind CSS 3.4.0
- **PWA**: @vite-pwa/nuxt
- **Storage**: IndexedDB (idb-keyval)
- **Barcode Reading**: jsQR for QR codes
- **Image Processing**: Sharp for icon generation
- **Utilities**: @vueuse/nuxt

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate PWA icons (optional, already generated):
```bash
node scripts/generate-icons.js
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or next available port).

## Usage

### Adding a Store Card
1. Click "Add New Store Card" on the main page
2. Enter the store name
3. Choose how to add the barcode:
   - **Type**: Manually enter barcode numbers
   - **Upload**: Select an image file containing a barcode/QR code
   - **Paste**: Copy an image and paste it (Ctrl+V)
4. Save the card

### Managing Cards
- **View**: Click on any card to see it in full-screen mode
- **Edit**: Click the edit icon on a card
- **Delete**: Click the delete icon and confirm
- **Search**: Use the search bar to find specific stores

### Card Display Features
- **Copy Barcode**: Copy barcode data to clipboard
- **Brightness Control**: Adjust screen brightness for better scanning
- **Fullscreen Mode**: View card in fullscreen for easier scanning

## File Structure

```
nuxt-app/
├── assets/css/main.css          # Global styles and Tailwind config
├── composables/
│   ├── useStorage.js            # IndexedDB storage management
│   └── useBarcodeReader.js      # Barcode/QR code processing
├── pages/
│   ├── index.vue                # Main page (card list)
│   ├── add.vue                  # Add/edit card page
│   └── card/[id].vue           # Card detail/display page
├── public/                      # PWA icons and static assets
├── scripts/generate-icons.js    # Icon generation script
├── nuxt.config.ts              # Nuxt and PWA configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## PWA Installation

The app can be installed as a PWA on supported devices:

1. **Mobile (Android/iOS)**:
   - Open in browser
   - Look for "Add to Home Screen" or "Install App" prompt

2. **Desktop (Chrome/Edge)**:
   - Click the install icon in the address bar
   - Or use browser menu > "Install StoreCard Manager"

## Offline Usage

Once installed, the app works completely offline:
- All cards are stored locally
- No internet connection required
- Data persists between sessions
- App updates when connection is restored

## Development

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Generate Static Site
```bash
npm run generate
```

## Browser Support

- **Modern browsers** with PWA support
- **IndexedDB** support required
- **File API** for image uploads
- **Clipboard API** for paste functionality

## License

This project is for educational/personal use.
