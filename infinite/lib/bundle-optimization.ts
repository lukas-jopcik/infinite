// Bundle optimization utilities for reducing unused JavaScript

// Lazy load heavy components
export const lazyLoadComponents = {
  // Heavy UI components
  Aurora: () => import('@/components/backgrounds/Aurora'),
  AdSenseBanner: () => import('@/components/AdSense').then(mod => ({ default: mod.AdSenseBanner })),
  
  // Analytics and tracking
  Analytics: () => import('@/components/Analytics'),
  
  // Form components (if any)
  ConsentBanner: () => import('@/components/ConsentBanner'),
}

// Critical components that should be loaded immediately
export const criticalComponents = [
  'ApodCard',
  'ApodHero', 
  'OptimizedImage',
  'ClientLayout',
]

// Non-critical components that can be lazy loaded
export const nonCriticalComponents = [
  'Aurora',
  'AdSenseBanner',
  'Analytics',
  'ConsentBanner',
]

// Bundle splitting strategy
export const bundleSplitting = {
  // Core app bundle
  core: [
    'next',
    'react',
    'react-dom',
  ],
  
  // UI components bundle
  ui: [
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    'lucide-react',
  ],
  
  // Analytics bundle (loaded after user interaction)
  analytics: [
    '@vercel/analytics',
    'web-vitals',
  ],
  
  // Heavy libraries bundle
  heavy: [
    'three',
    'ogl',
  ],
}

// Tree shaking optimization
export const treeShakingOptimizations = {
  // Import only what we need from large libraries
  lucideReact: {
    // Only import icons we actually use
    icons: [
      'ChevronDown',
      'ChevronLeft', 
      'ChevronRight',
      'Play',
      'X',
      'Menu',
    ]
  },
  
  // Radix UI - only import used components
  radixUI: {
    components: [
      'Accordion',
      'Dialog', 
      'DropdownMenu',
      'NavigationMenu',
    ]
  }
}

// Code splitting utilities
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFunc)
}

// Bundle size monitoring
export function getBundleSize() {
  if (typeof window === 'undefined') return null
  
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  
  return {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    totalSize: scripts.length + stylesheets.length,
  }
}

// Performance budget enforcement
export const performanceBudget = {
  // Maximum bundle sizes (in KB)
  maxBundleSize: 250, // 250KB
  maxInitialBundle: 100, // 100KB for initial load
  maxLazyBundle: 50, // 50KB for lazy loaded chunks
  
  // Maximum number of requests
  maxInitialRequests: 10,
  maxTotalRequests: 20,
  
  // Core Web Vitals thresholds
  maxLCP: 2500, // 2.5s
  maxFID: 100, // 100ms
  maxCLS: 0.1, // 0.1
}

// Bundle optimization recommendations
export function getOptimizationRecommendations() {
  const bundleSize = getBundleSize()
  
  if (!bundleSize) return []
  
  const recommendations = []
  
  if (bundleSize.totalSize > performanceBudget.maxTotalRequests) {
    recommendations.push('Consider code splitting to reduce number of requests')
  }
  
  if (bundleSize.scripts > performanceBudget.maxInitialRequests) {
    recommendations.push('Lazy load non-critical JavaScript')
  }
  
  return recommendations
}
