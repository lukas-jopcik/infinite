'use client'

import { useEffect, useRef } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  adStyle?: React.CSSProperties
  className?: string
  responsive?: boolean
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

// Type assertion for AdSense
const getAdSense = () => {
  if (typeof window !== 'undefined') {
    return (window as any).adsbygoogle as any[]
  }
  return []
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  responsive = true,
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const adLoaded = useRef(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && adRef.current && !adLoaded.current) {
        const adsbygoogle = getAdSense()
        if (adsbygoogle) {
          // Check if ads are already loaded for this specific element
          const adElement = adRef.current.querySelector('.adsbygoogle')
          if (adElement && !adElement.hasAttribute('data-adsbygoogle-status')) {
            adsbygoogle.push({})
            adLoaded.current = true
          }
        }
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [adSlot])

  return (
    <div ref={adRef} className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-7836061933361865"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

// Predefined ad components for common placements
export function AdSenseBanner({ className = '' }: { className?: string }) {
  return (
    <AdSense
      adSlot="1234567890" // Replace with your actual ad slot ID
      adFormat="auto"
      className={`w-full max-w-4xl mx-auto my-4 ${className}`}
      responsive={true}
    />
  )
}

export function AdSenseRectangle({ className = '' }: { className?: string }) {
  return (
    <AdSense
      adSlot="1234567890" // Replace with your actual ad slot ID
      adFormat="rectangle"
      adStyle={{ display: 'block', width: '300px', height: '250px' }}
      className={`mx-auto my-4 ${className}`}
      responsive={false}
    />
  )
}

export function AdSenseVertical({ className = '' }: { className?: string }) {
  return (
    <AdSense
      adSlot="1234567890" // Replace with your actual ad slot ID
      adFormat="vertical"
      adStyle={{ display: 'block', width: '160px', height: '600px' }}
      className={`mx-auto my-4 ${className}`}
      responsive={false}
    />
  )
}
