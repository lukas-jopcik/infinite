"use client"
import Image from 'next/image'
import { useState } from 'react'
import { getBestImageUrl, isImageUrlReliable } from '@/lib/image-loader'

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
  const [currentSrc, setCurrentSrc] = useState(src)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Get the best available image URL with fallbacks
  const bestSrc = getBestImageUrl(currentSrc, hdSrc, src)
  
  // Use consistent quality and sizes to avoid hydration mismatch
  const finalQuality = quality
  const finalSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  const finalSrc = bestSrc

  const handleLoad = () => {
    setIsLoading(false)
    setImageLoaded(true)
  }

  const handleError = () => {
    // Try fallback to original src if we're using hdSrc
    if (currentSrc !== src && src) {
      console.log(`🔄 Image failed, trying fallback: ${src}`)
      setCurrentSrc(src)
      setHasError(false)
      return
    }
    
    // If all sources failed, show error
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
      <>
        <Image
          src={finalSrc}
          alt={alt}
          fill
          className={`${className} transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          priority={priority}
          sizes={finalSizes}
          quality={finalQuality}
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
          onLoad={handleLoad}
          onError={handleError}
        />
        {!imageLoaded && (
          <div 
            className="absolute inset-0 bg-gray-800 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        priority={priority}
        quality={finalQuality}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`}
        sizes={finalSizes}
        onLoad={handleLoad}
        onError={handleError}
      />
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-800 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml;base64,${toBase64(shimmer(width, height))}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
    </>
  )
}
