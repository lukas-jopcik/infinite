'use client'

import { ArticleTracking, SocialShare, ReadingProgress } from './article-tracking'
import { useState, useEffect } from 'react'

interface ArticlePageWrapperProps {
  article: {
    slug: string
    title: string
    category: string
    author?: string
    readTime?: number
    originalDate?: string
  }
  children: React.ReactNode
}

export function ArticlePageWrapper({ article, children }: ArticlePageWrapperProps) {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrollTop / scrollHeight, 1)
      setReadingProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ArticleTracking article={article}>
      <ReadingProgress progress={readingProgress} />
      {children}
    </ArticleTracking>
  )
}

// Social sharing section component
interface SocialSharingSectionProps {
  articleSlug: string
  articleTitle: string
  url: string
}

export function SocialSharingSection({ articleSlug, articleTitle, url }: SocialSharingSectionProps) {
  return (
    <section className="mt-8 border-t border-border pt-8">
      <SocialShare 
        articleSlug={articleSlug}
        articleTitle={articleTitle}
        url={url}
      />
    </section>
  )
}
