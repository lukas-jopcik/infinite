/**
 * Custom image loader for better handling of NASA URLs and fallbacks
 */

export interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

export function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If it's already a Next.js optimized URL, return as-is
  if (src.includes('/_next/image')) {
    return src
  }

  // If it's a NASA URL, try to use our cached version first
  if (src.includes('apod.nasa.gov')) {
    // For now, let Next.js handle the optimization
    // In the future, we could implement a custom proxy
    return src
  }

  // For S3/CloudFront URLs, return as-is
  if (src.includes('s3.amazonaws.com') || src.includes('cloudfront.net')) {
    return src
  }

  // Default behavior
  return src
}

/**
 * Check if an image URL is likely to work
 */
export function isImageUrlReliable(url: string): boolean {
  // S3 and CloudFront URLs are more reliable
  if (url.includes('s3.amazonaws.com') || url.includes('cloudfront.net')) {
    return true
  }
  
  // NASA URLs can be unreliable
  if (url.includes('apod.nasa.gov')) {
    return false
  }
  
  return true
}

/**
 * Get the best available image URL with fallbacks
 */
export function getBestImageUrl(
  cachedUrl?: string,
  hdUrl?: string,
  standardUrl?: string
): string {
  // Prioritize cached images (most reliable)
  if (cachedUrl && isImageUrlReliable(cachedUrl)) {
    return cachedUrl
  }
  
  // Fallback to HD URL if available
  if (hdUrl && isImageUrlReliable(hdUrl)) {
    return hdUrl
  }
  
  // Fallback to standard URL
  if (standardUrl) {
    return standardUrl
  }
  
  // Last resort
  return cachedUrl || hdUrl || standardUrl || ''
}
