import { ref, computed } from 'vue'

export const usePWAInstall = () => {
  const deferredPrompt = ref(null)
  const isInstallable = ref(false)
  const installPromptShown = ref(false)

  // Check if PWA is installable
  const checkInstallability = () => {
    if (!process.client) return false

    const criteria = {
      https: location.protocol === 'https:' || location.hostname === 'localhost',
      serviceWorker: 'serviceWorker' in navigator,
      manifest: document.querySelector('link[rel="manifest"]') !== null,
      notInstalled: !window.matchMedia('(display-mode: standalone)').matches && 
                   !window.navigator.standalone &&
                   !document.referrer.includes('android-app://'),
      engagement: true // Simplified for now
    }

    console.log('PWA Install Criteria:', criteria)
    
    return Object.values(criteria).every(Boolean)
  }

  // Check if app is already installed
  const isAppInstalled = computed(() => {
    if (!process.client) return false
    
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://')
  })

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = (e) => {
    console.log('PWA: beforeinstallprompt event captured', e)
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true

    // Auto-show prompt after delay if not dismissed
    if (!localStorage.getItem('pwa-install-dismissed')) {
      setTimeout(() => {
        if (!isAppInstalled.value && !installPromptShown.value) {
          console.log('PWA: Auto-showing install prompt')
          showInstallPrompt()
        }
      }, 3000)
    } else {
      console.log('PWA: Install prompt was previously dismissed')
    }
  }

  // Show install prompt
  const showInstallPrompt = () => {
    installPromptShown.value = true
    window.dispatchEvent(new CustomEvent('show-pwa-install-prompt'))
  }

  // Trigger native install
  const triggerInstall = async () => {
    if (!deferredPrompt.value) {
      console.log('PWA: No deferred prompt available')
      return false
    }

    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      
      console.log('PWA: Install prompt outcome:', outcome)
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted install')
      } else {
        console.log('PWA: User dismissed install')
      }
      
      deferredPrompt.value = null
      isInstallable.value = false
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('PWA: Error during install:', error)
      return false
    }
  }

  // Dismiss install prompt
  const dismissInstall = () => {
    localStorage.setItem('pwa-install-dismissed', 'true')
    installPromptShown.value = false
    
    // Allow showing again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  // Initialize PWA install detection
  const initPWAInstall = () => {
    if (!process.client) return

    // Check initial installability
    isInstallable.value = checkInstallability()
    
    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed')
      deferredPrompt.value = null
      isInstallable.value = false
      installPromptShown.value = false
    })

    // Debug: Log current state
    console.log('PWA: Install detection initialized', {
      isInstallable: isInstallable.value,
      isInstalled: isAppInstalled.value,
      userAgent: navigator.userAgent,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
    })
  }

  // Cleanup
  const cleanupPWAInstall = () => {
    if (process.client) {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }

  return {
    deferredPrompt,
    isInstallable,
    isAppInstalled,
    installPromptShown,
    checkInstallability,
    showInstallPrompt,
    triggerInstall,
    dismissInstall,
    initPWAInstall,
    cleanupPWAInstall
  }
}
