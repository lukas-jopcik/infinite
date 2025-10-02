// Resource loading optimization utilities

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload critical images
  const criticalImages = [
    // Add critical image URLs here
  ]

  criticalImages.forEach((imageUrl) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = imageUrl
    document.head.appendChild(link)
  })

  // Preload critical fonts
  const criticalFonts = [
    {
      href: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ]

  criticalFonts.forEach((font) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font.href
    link.as = font.as
    link.type = font.type
    if (font.crossOrigin) {
      link.crossOrigin = font.crossOrigin
    }
    document.head.appendChild(link)
  })
}

// Preconnect to external domains
export function preconnectExternalDomains() {
  if (typeof window === 'undefined') return

  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://apod.nasa.gov',
    'https://pagead2.googlesyndication.com',
    'https://www.googletagmanager.com',
  ]

  domains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// DNS prefetch for external resources
export function dnsPrefetchExternalResources() {
  if (typeof window === 'undefined') return

  const domains = [
    '//apod.nasa.gov',
    '//pagead2.googlesyndication.com',
    '//www.googletagmanager.com',
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
  ]

  domains.forEach((domain) => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Resource hints for better loading
export function addResourceHints() {
  if (typeof window === 'undefined') return

  // Add all resource hints
  preconnectExternalDomains()
  dnsPrefetchExternalResources()
  preloadCriticalResources()
}

// Lazy load non-critical resources
export function lazyLoadNonCriticalResources() {
  if (typeof window === 'undefined') return

  // Lazy load analytics after user interaction
  const loadAnalytics = () => {
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-WV1LXLMTJ6'
    script.async = true
    document.head.appendChild(script)
  }

  // Load analytics after first user interaction
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  const loadAnalyticsOnInteraction = () => {
    loadAnalytics()
    events.forEach(event => {
      document.removeEventListener(event, loadAnalyticsOnInteraction)
    })
  }

  events.forEach(event => {
    document.addEventListener(event, loadAnalyticsOnInteraction, { once: true })
  })
}

// Optimize third-party scripts
export function optimizeThirdPartyScripts() {
  if (typeof window === 'undefined') return

  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script[src]')
  scripts.forEach((script) => {
    const src = script.getAttribute('src')
    if (src && (
      src.includes('googletagmanager') ||
      src.includes('googlesyndication') ||
      src.includes('analytics')
    )) {
      script.defer = true
    }
  })
}

// Resource loading optimization
export function optimizeResourceLoading() {
  if (typeof window === 'undefined') return

  // Add resource hints
  addResourceHints()
  
  // Lazy load non-critical resources
  lazyLoadNonCriticalResources()
  
  // Optimize third-party scripts
  optimizeThirdPartyScripts()
}

// Network optimization
export function optimizeNetworkRequests() {
  if (typeof window === 'undefined') return

  // Implement request batching
  const batchRequests = (requests: Request[]) => {
    // Batch similar requests together
    const batchedRequests = new Map()
    
    requests.forEach((request) => {
      const key = request.url.split('?')[0] // Group by base URL
      if (!batchedRequests.has(key)) {
        batchedRequests.set(key, [])
      }
      batchedRequests.get(key).push(request)
    })
    
    return batchedRequests
  }

  // Implement request deduplication
  const requestCache = new Map()
  
  const deduplicateRequests = (url: string) => {
    if (requestCache.has(url)) {
      return requestCache.get(url)
    }
    
    const promise = fetch(url)
    requestCache.set(url, promise)
    
    // Clear cache after 5 minutes
    setTimeout(() => {
      requestCache.delete(url)
    }, 5 * 60 * 1000)
    
    return promise
  }

  return {
    batchRequests,
    deduplicateRequests,
  }
}

// Performance monitoring for resources
export function monitorResourcePerformance() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming
        
        // Log slow resources
        if (resource.duration > 1000) {
          console.warn('Slow resource:', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
          })
        }
        
        // Log large resources
        if (resource.transferSize > 100000) { // 100KB
          console.warn('Large resource:', {
            name: resource.name,
            size: resource.transferSize,
            duration: resource.duration,
          })
        }
      }
    })
  })

  observer.observe({ entryTypes: ['resource'] })
  
  return observer
}
