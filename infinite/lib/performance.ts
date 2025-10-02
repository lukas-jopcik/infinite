import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }

  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(() => {
      // Silently fail if analytics endpoint is not available
    })
  }
}

export function initWebVitals() {
  if (typeof window === 'undefined') return

  onCLS(reportWebVitals)
  onFCP(reportWebVitals)
  onLCP(reportWebVitals)
  onTTFB(reportWebVitals)
  onINP(reportWebVitals)
}

// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  if (typeof window === 'undefined') {
    fn()
    return
  }

  const start = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    result.then(() => {
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
    })
  } else {
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  }
}

// Resource timing utilities
export function getResourceTimings() {
  if (typeof window === 'undefined') return []

  return performance.getEntriesByType('resource').map((entry: any) => ({
    name: entry.name,
    duration: entry.duration,
    transferSize: entry.transferSize,
    encodedBodySize: entry.encodedBodySize,
    decodedBodySize: entry.decodedBodySize,
  }))
}

// Navigation timing utilities
export function getNavigationTiming() {
  if (typeof window === 'undefined') return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstByte: navigation.responseStart - navigation.requestStart,
    domInteractive: navigation.domInteractive - navigation.navigationStart,
    totalPageLoad: navigation.loadEventEnd - navigation.navigationStart,
  }
}
