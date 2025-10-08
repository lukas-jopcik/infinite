'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor LCP
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
            // Send to analytics
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'LCP',
                value: Math.round(entry.startTime),
                event_category: 'Web Vitals',
              })
            }
          }
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // Monitor CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as { hadRecentInput?: boolean; value?: number }
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0
          }
        }
        console.log('CLS:', clsValue)
        // Send to analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Web Vitals',
          })
        }
      })
      
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Monitor FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as { processingStart?: number; startTime?: number }
          const fidValue = (fidEntry.processingStart || 0) - (fidEntry.startTime || 0)
          console.log('FID:', fidValue)
          // Send to analytics
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fidValue),
              event_category: 'Web Vitals',
            })
          }
        }
      })
      
      fidObserver.observe({ entryTypes: ['first-input'] })

      return () => {
        observer.disconnect()
        clsObserver.disconnect()
        fidObserver.disconnect()
      }
    }
  }, [])

  return null
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
