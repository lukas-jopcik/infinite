'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  HeaderAd, 
  SidebarAd, 
  FooterAd, 
  ArticleAd, 
  InFeedAd, 
  AdPlaceholder 
} from './google-adsense'
import { ADSENSE_CONFIG } from '@/lib/config'

interface AdManagerProps {
  children: React.ReactNode
  showAds?: boolean
  adFrequency?: number
}

export function AdManager({ 
  children, 
  showAds = true, 
  adFrequency = 6 
}: AdManagerProps) {
  const [adsEnabled, setAdsEnabled] = useState(false)
  const [userConsent, setUserConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if ads should be enabled
    const shouldShowAds = showAds && ADSENSE_CONFIG.enabled
    setAdsEnabled(shouldShowAds)

    // Check for user consent (GDPR compliance)
    const consent = localStorage.getItem('ads-consent')
    if (consent !== null) {
      setUserConsent(consent === 'true')
    }
  }, [showAds])

  const handleConsent = (consent: boolean) => {
    setUserConsent(consent)
    localStorage.setItem('ads-consent', consent.toString())
  }

  // Show consent banner if no consent given
  if (userConsent === null && adsEnabled) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Táto stránka používa reklamy na poskytovanie bezplatného obsahu. 
            Súhlasíte s ich zobrazovaním?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleConsent(false)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Odmietnuť
            </button>
            <button
              onClick={() => handleConsent(true)}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Súhlasiť
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdContext.Provider value={{ 
      adsEnabled: adsEnabled && userConsent === true,
      adFrequency 
    }}>
      {children}
    </AdContext.Provider>
  )
}

// Ad context for managing ad state
import { createContext, useContext } from 'react'

interface AdContextType {
  adsEnabled: boolean
  adFrequency: number
}

const AdContext = createContext<AdContextType>({
  adsEnabled: false,
  adFrequency: 6
})

export function useAdContext() {
  return useContext(AdContext)
}

// Ad container component
interface AdContainerProps {
  position: 'header' | 'sidebar' | 'footer' | 'article' | 'in-feed'
  index?: number
  className?: string
}

export function AdContainer({ position, index, className }: AdContainerProps) {
  const { adsEnabled } = useAdContext()

  if (!adsEnabled) {
    return <AdPlaceholder title={`${position} reklama`} className={className} />
  }

  switch (position) {
    case 'header':
      return <HeaderAd />
    case 'sidebar':
      return <SidebarAd />
    case 'footer':
      return <FooterAd />
    case 'article':
      return <ArticleAd />
    case 'in-feed':
      return index !== undefined ? <InFeedAd index={index} /> : null
    default:
      return null
  }
}

// Intersection observer hook for lazy loading ads
export function useAdIntersection() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Lazy loaded ad component
interface LazyAdProps {
  position: 'header' | 'sidebar' | 'footer' | 'article' | 'in-feed'
  index?: number
  className?: string
}

export function LazyAd({ position, index, className }: LazyAdProps) {
  const { ref, isVisible } = useAdIntersection()

  return (
    <div ref={ref} className={className}>
      {isVisible && <AdContainer position={position} index={index} />}
    </div>
  )
}

// Ad blocker detection
export function useAdBlocker() {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false)

  useEffect(() => {
    const checkAdBlocker = () => {
      const testAd = document.createElement('div')
      testAd.innerHTML = '&nbsp;'
      testAd.className = 'adsbox'
      testAd.style.position = 'absolute'
      testAd.style.left = '-999px'
      testAd.style.top = '-999px'
      
      document.body.appendChild(testAd)
      
      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0
        setIsAdBlockerActive(isBlocked)
        document.body.removeChild(testAd)
      }, 100)
    }

    checkAdBlocker()
  }, [])

  return isAdBlockerActive
}

// Ad blocker notice component
export function AdBlockerNotice() {
  const isAdBlockerActive = useAdBlocker()
  const { adsEnabled } = useAdContext()

  if (!isAdBlockerActive || !adsEnabled) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-yellow-600">⚠️</div>
        <div>
          <h3 className="font-medium text-yellow-800 mb-1">
            Detekovaný blokovač reklám
          </h3>
          <p className="text-sm text-yellow-700">
            Naša stránka je financovaná reklamami. Zvážte vypnutie blokovača reklám 
            alebo podporte nás inak, aby sme mohli pokračovať v poskytovaní bezplatného obsahu.
          </p>
        </div>
      </div>
    </div>
  )
}
