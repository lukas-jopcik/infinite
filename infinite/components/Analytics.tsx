"use client"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default function Analytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-WV1LXLMTJ6'
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoaded, setIsLoaded] = useState(false)

  // Route-change pageview for GA
  useEffect(() => {
    // Skip analytics in development or if no GA_ID
    if (!GA_ID || typeof window === "undefined" || process.env.NODE_ENV === 'development') return
    
    // Delay analytics loading to improve initial page load
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [GA_ID])

  useEffect(() => {
    if (!isLoaded || !GA_ID || typeof window === "undefined") return
    
    // Apply saved consent on hydration, if available
    try {
      const saved = localStorage.getItem('ga_consent_v1')
      if (saved && typeof window.gtag === 'function') {
        const consent = saved === 'granted' ? 'granted' : 'denied'
        window.gtag('consent', 'update', {
          ad_storage: consent,
          ad_user_data: consent,
          ad_personalization: consent,
          analytics_storage: consent,
        })
      }
    } catch {}
    
    const path = `${pathname || ""}${searchParams?.toString() ? `?${searchParams!.toString()}` : ""}`
    if (window.gtag) {
      window.gtag('config', GA_ID, { page_path: path })
    }
  }, [GA_ID, pathname, searchParams, isLoaded])

  if (!GA_ID || !isLoaded || process.env.NODE_ENV === 'development') return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="gtag-init" strategy="lazyOnload">{
        `window.dataLayer = window.dataLayer || [];\n` +
        `function gtag(){dataLayer.push(arguments);}\n` +
        // Consent Mode v2: default to denied until user acts
        `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });\n` +
        `gtag('js', new Date());\n` +
        `gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: false });`
      }</Script>
    </>
  )
}


