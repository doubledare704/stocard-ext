export const useTheme = () => {
  const isDark = ref(false)
  
  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('storecard-theme')
      
      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else {
        // Use system preference as default
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      applyTheme()
    }
  }
  
  // Apply theme to document
  const applyTheme = () => {
    if (process.client) {
      const html = document.documentElement
      
      if (isDark.value) {
        html.classList.add('dark')
        // Update PWA theme color for dark mode
        updateThemeColor('#1f2937') // gray-800
      } else {
        html.classList.remove('dark')
        // Update PWA theme color for light mode
        updateThemeColor('#3b82f6') // blue-600
      }
    }
  }
  
  // Update PWA theme color
  const updateThemeColor = (color) => {
    if (process.client) {
      let themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', color)
      } else {
        themeColorMeta = document.createElement('meta')
        themeColorMeta.name = 'theme-color'
        themeColorMeta.content = color
        document.head.appendChild(themeColorMeta)
      }
    }
  }
  
  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    
    if (process.client) {
      localStorage.setItem('storecard-theme', isDark.value ? 'dark' : 'light')
      applyTheme()
    }
  }
  
  // Watch for theme changes
  watch(isDark, () => {
    applyTheme()
  })
  
  // Listen for system theme changes
  const watchSystemTheme = () => {
    if (process.client) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't set a preference
        if (!localStorage.getItem('storecard-theme')) {
          isDark.value = e.matches
        }
      })
    }
  }
  
  return {
    isDark: readonly(isDark),
    toggleTheme,
    initializeTheme,
    watchSystemTheme
  }
}
