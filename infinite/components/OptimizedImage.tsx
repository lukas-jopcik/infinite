"use client"
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { isMobileDevice, getMobileImageConfig, getMobileImageUrl } from '@/lib/mobile-optimization'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  quality?: number
  hdSrc?: string // Optional HD source
}

// Optimized blur placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  priority = false,
  width = 800,
  height = 600,
  fill = false,
  sizes,
  quality = 70,
  hdSrc
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])
  
  // Get mobile-optimized config
  const mobileConfig = isMobile ? getMobileImageConfig() : { quality: 70, sizes: sizes }
  const finalQuality = isMobile ? mobileConfig.quality || 50 : quality
  const finalSizes = isMobile ? mobileConfig.sizes || sizes : sizes
  
  // Get mobile-optimized image URL (no HD on mobile)
  const finalSrc = isMobile ? getMobileImageUrl(src, hdSrc) : (hdSrc || src)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={fill ? { width: '100%', height: '100%' } : { width, height }}
      >
        <span className="text-gray-400 text-sm">Obrázok sa nepodarilo načítať</span>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        sizes={finalSizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        quality={finalQuality}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      priority={priority}
      quality={finalQuality}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`}
      sizes={finalSizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}
