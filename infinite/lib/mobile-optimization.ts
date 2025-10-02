// Mobile-specific performance optimizations

// Mobile device detection
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768
}

// Mobile-specific image optimization
export function getMobileImageConfig() {
  return {
    quality: 60, // Lower quality for mobile
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority: false, // Reduce priority on mobile
    loading: 'lazy' as const,
  }
}

// Mobile-specific bundle optimization
export function optimizeForMobile() {
  if (typeof window === 'undefined') return
  
  if (!isMobileDevice()) return
  
  // Reduce animation complexity on mobile
  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 768px) {
      /* Reduce animations on mobile */
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      
      /* Simplify hover effects */
      .hover\\:scale-105:hover {
        transform: none !important;
      }
      
      /* Reduce blur effects */
      .backdrop-blur {
        backdrop-filter: none !important;
      }
    }
    
    /* Prefers reduced motion */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `
  document.head.appendChild(style)
}

// Mobile-specific resource loading
export function optimizeMobileResourceLoading() {
  if (typeof window === 'undefined') return
  
  if (!isMobileDevice()) return
  
  // Reduce initial bundle size for mobile
  const mobileOptimizations = {
    // Defer non-critical scripts
    deferScripts: () => {
      const scripts = document.querySelectorAll('script[src]')
      scripts.forEach((script) => {
        const src = script.getAttribute('src')
        if (src && (
          src.includes('analytics') ||
          src.includes('ads') ||
          src.includes('tracking')
        )) {
          script.setAttribute('defer', 'true')
        }
      })
    },
    
    // Reduce image quality for mobile
    optimizeImages: () => {
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        if (img.src && !img.src.includes('data:')) {
          // Add mobile-specific loading attributes
          img.setAttribute('loading', 'lazy')
          img.setAttribute('decoding', 'async')
        }
      })
    },
    
    // Simplify CSS for mobile
    simplifyCSS: () => {
      const style = document.createElement('style')
      style.textContent = `
        @media (max-width: 768px) {
          /* Remove complex gradients */
          .bg-gradient-to-br {
            background: #000 !important;
          }
          
          /* Simplify shadows */
          .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          
          /* Reduce border radius */
          .rounded-lg, .rounded-xl {
            border-radius: 0.25rem !important;
          }
        }
      `
      document.head.appendChild(style)
    }
  }
  
  // Apply mobile optimizations
  mobileOptimizations.deferScripts()
  mobileOptimizations.optimizeImages()
  mobileOptimizations.simplifyCSS()
}

// Mobile-specific performance monitoring
export function monitorMobilePerformance() {
  if (typeof window === 'undefined') return
  
  if (!isMobileDevice()) return
  
  // Monitor mobile-specific metrics
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const nav = entry as PerformanceNavigationTiming
        
        // Log slow mobile metrics
        if (nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart > 1000) {
          console.warn('Slow mobile DOM loading:', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart)
        }
        
        if (nav.loadEventEnd - nav.loadEventStart > 2000) {
          console.warn('Slow mobile page load:', nav.loadEventEnd - nav.loadEventStart)
        }
      }
      
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming
        
        // Log slow mobile resources
        if (resource.duration > 2000) {
          console.warn('Slow mobile resource:', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
          })
        }
      }
    })
  })
  
  observer.observe({ entryTypes: ['navigation', 'resource'] })
  
  return observer
}

// Mobile-specific critical resource prioritization
export function prioritizeMobileResources() {
  if (typeof window === 'undefined') return
  
  if (!isMobileDevice()) return
  
  // Preload critical mobile resources
  const criticalResources = [
    // Add critical mobile resources here
  ]
  
  criticalResources.forEach((resource) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.url
    link.as = resource.type
    if (resource.crossOrigin) {
      link.crossOrigin = resource.crossOrigin
    }
    document.head.appendChild(link)
  })
}

// Mobile-specific initialization
export function initializeMobileOptimizations() {
  if (typeof window === 'undefined') return
  
  if (!isMobileDevice()) return
  
  // Apply all mobile optimizations
  optimizeForMobile()
  optimizeMobileResourceLoading()
  monitorMobilePerformance()
  prioritizeMobileResources()
  
  // Add mobile-specific viewport optimization
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
}

// Mobile-specific bundle splitting
export function getMobileBundleConfig() {
  return {
    // Smaller chunks for mobile
    maxChunkSize: 50 * 1024, // 50KB
    maxInitialChunkSize: 100 * 1024, // 100KB
    
    // Mobile-specific code splitting
    mobileChunks: {
      critical: ['react', 'react-dom', 'next'],
      ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog'],
      analytics: ['@vercel/analytics', 'web-vitals'],
      heavy: ['three', 'ogl'],
    },
    
    // Mobile-specific lazy loading
    lazyLoadThreshold: 0.5, // Load when 50% visible
    preloadThreshold: 0.8, // Preload when 80% visible
  }
}
