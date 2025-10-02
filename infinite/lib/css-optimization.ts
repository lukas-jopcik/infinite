// CSS optimization utilities

// Critical CSS extraction
export const criticalCSS = `
  /* Critical above-the-fold styles */
  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
    background-color: #000;
    color: #fff;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Critical layout styles */
  .grid {
    display: grid;
    gap: 1.5rem;
  }
  
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  @media (min-width: 768px) {
    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .lg\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  
  /* Critical image styles */
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  .object-cover {
    object-fit: cover;
  }
  
  /* Critical text styles */
  .text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  
  .font-bold {
    font-weight: 700;
  }
  
  .mb-8 {
    margin-bottom: 2rem;
  }
`

// Non-critical CSS that can be loaded later
export const nonCriticalCSS = `
  /* Hover effects */
  .hover\\:scale-105:hover {
    transform: scale(1.05);
  }
  
  .hover\\:text-blue-300:hover {
    color: #93c5fd;
  }
  
  /* Transitions */
  .transition-transform {
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  .transition-colors {
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  
  /* Animations */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
  
  /* Complex layouts */
  .fixed {
    position: fixed;
  }
  
  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  
  .-z-10 {
    z-index: -10;
  }
`

// CSS loading optimization
export function optimizeCSSLoading() {
  if (typeof window === 'undefined') return

  // Inline critical CSS
  const criticalStyle = document.createElement('style')
  criticalStyle.textContent = criticalCSS
  criticalStyle.setAttribute('data-critical', 'true')
  document.head.appendChild(criticalStyle)

  // Load non-critical CSS asynchronously
  const loadNonCriticalCSS = () => {
    const style = document.createElement('style')
    style.textContent = nonCriticalCSS
    style.setAttribute('data-non-critical', 'true')
    document.head.appendChild(style)
  }

  // Load non-critical CSS after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNonCriticalCSS)
  } else {
    loadNonCriticalCSS()
  }
}

// CSS purging utilities
export function purgeUnusedCSS() {
  if (typeof window === 'undefined') return

  // Remove unused CSS classes
  const usedClasses = new Set()
  
  // Scan DOM for used classes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  )
  
  let node
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const classList = element.classList
      classList.forEach(className => usedClasses.add(className))
    }
  }
  
  // Remove unused stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
  stylesheets.forEach(stylesheet => {
    const href = stylesheet.getAttribute('href')
    if (href && !href.includes('critical')) {
      // Check if stylesheet is needed
      const isNeeded = Array.from(usedClasses).some(className => 
        href.includes(className)
      )
      
      if (!isNeeded) {
        stylesheet.remove()
      }
    }
  })
}

// CSS performance monitoring
export function monitorCSSPerformance() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.name.includes('.css')) {
        const cssResource = entry as PerformanceResourceTiming
        
        // Log slow CSS loads
        if (cssResource.duration > 500) {
          console.warn('Slow CSS load:', {
            name: cssResource.name,
            duration: cssResource.duration,
            size: cssResource.transferSize,
          })
        }
      }
    })
  })

  observer.observe({ entryTypes: ['resource'] })
  
  return observer
}

// CSS optimization initialization
export function initializeCSSOptimization() {
  if (typeof window === 'undefined') return

  // Optimize CSS loading
  optimizeCSSLoading()
  
  // Monitor CSS performance
  monitorCSSPerformance()
  
  // Purge unused CSS after page load
  window.addEventListener('load', () => {
    setTimeout(purgeUnusedCSS, 1000)
  })
}
