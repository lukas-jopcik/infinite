import { Inter } from 'next/font/google'

// Optimized font loading with display swap and preload
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
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

// Font loading optimization utilities
export function preloadFonts() {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const fontPreloads = [
    {
      href: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ]

  fontPreloads.forEach((font) => {
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
