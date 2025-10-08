'use client'

import React, { Suspense, lazy } from 'react'

interface LazySectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazySection({ children, fallback }: LazySectionProps) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-muted h-32 rounded-lg" />}>
      {children}
    </Suspense>
  )
}

// Lazy load heavy components
export const LazyNewsletterSignup = lazy(() => 
  import('./newsletter-signup').then(module => ({ default: module.NewsletterSignup }))
)

export const LazyArticleCard = lazy(() => 
  import('./article-card').then(module => ({ default: module.ArticleCard }))
)

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
}
