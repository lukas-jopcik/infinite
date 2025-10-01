'use client'

import { useEffect } from 'react'

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

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  responsive = true,
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`}>
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
