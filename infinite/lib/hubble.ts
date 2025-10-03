export type HubbleItem = {
  guid: string // unique ID from RSS
  title: string
  link: string // permalink to ESA Hubble detail page
  pubDate: string // ISO 8601 format
  description: string // HTML description
  excerpt: string // plain text excerpt, max ~240 chars
  category?: string[] // tags
  image_main?: string // highest resolution image URL
  image_variants?: Array<{
    url: string
    type: string
    width?: number
    height?: number
  }>
  credit_raw?: string // raw credit string from RSS
  copyright_raw?: string // raw copyright string from RSS
  credit_fallback?: string // scraped credit from detail page
  keywords?: string[] // additional tags from media:keywords
  // SEO fields (generated later)
  headline?: string // curiosity-driven Slovak headline
  headlineEN?: string // curiosity-driven English headline
  slovakArticle?: string
  seoKeywords?: string[]
  contentQuality?: number
  seoArticle?: {
    metaTitle?: string
    metaDescription?: string
    intro?: string
    article?: string
    faq?: string
    conclusion?: string
    internalLinks?: string[]
    externalRefs?: string[]
  }
}

export type HubbleApiResponse = {
  items: HubbleItem[]
  count: number
  lastUpdated: string
}

// RSS parsing utilities
export function parseRssDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toISOString()
  } catch (error) {
    console.error('Error parsing RSS date:', dateString, error)
    return new Date().toISOString()
  }
}

export function extractExcerpt(html: string, maxLength: number = 240): string {
  // Remove HTML tags and get plain text
  const text = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
  
  if (text.length <= maxLength) {
    return text
  }
  
  // Find the last complete word within the limit
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) { // If we can find a good break point
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

export function extractImageFromDescription(description: string): string | null {
  // Look for img src in the description
  const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i)
  return imgMatch ? imgMatch[1] : null
}

export function parseImageUrl(url: string): string {
  // Clean up malformed URLs from RSS
  if (url.includes('https://www.esahubble.orghttps://')) {
    return url.replace('https://www.esahubble.orghttps://', 'https://')
  }
  return url
}
