import { Inter } from 'next/font/google'

// Optimized font loading with display swap
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Let Next.js handle preloading
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  variable: '--font-inter',
  // Reduce font weight variants to minimize bundle size
  weight: ['400', '500', '600', '700'],
})

// Font loading optimization utilities (disabled to prevent conflicts)
export function preloadFonts() {
  // Disabled - Next.js handles font preloading automatically
  return
}

// Font display optimization
export function optimizeFontDisplay() {
  if (typeof window === 'undefined') return

  // Add font-display: swap to all font faces
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-display: swap;
    }
  `
  document.head.appendChild(style)
}
