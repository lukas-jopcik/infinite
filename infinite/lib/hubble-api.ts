import type { HubbleItem } from "@/lib/hubble"

type HubbleApiLatestResponse = {
  items: HubbleApiItem[]
  count: number
  lastUpdated: string
}

type HubbleApiItem = {
  guid: string
  title: string
  link: string
  pubDate: string
  description: string
  excerpt: string
  category?: string[]
  image_main?: string
  image_variants?: Array<{
    url: string
    type: string
    width?: number
    height?: number
  }>
  credit_raw?: string
  copyright_raw?: string
  credit_fallback?: string
  keywords?: string[]
  // SEO fields (generated)
  headline?: string
  headlineEN?: string
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

function mapApiItemToHubble(item: HubbleApiItem): HubbleItem {
  // Prefer new curiosity-driven headline, fallback to original title
  const title = item.headline?.trim() || item.title?.trim() || ""
  const explanation = item.slovakArticle?.trim() || ""
  
  // Use main image as primary URL
  const url = item.image_main || ""
  
  return {
    guid: item.guid,
    title,
    link: item.link,
    pubDate: item.pubDate,
    description: item.description,
    excerpt: item.excerpt,
    category: item.category,
    image_main: item.image_main,
    image_variants: item.image_variants,
    credit_raw: item.credit_raw,
    copyright_raw: item.copyright_raw,
    credit_fallback: item.credit_fallback,
    keywords: item.keywords,
    // Store both headlines for potential future use
    headlineEN: item.headlineEN?.trim(),
    // SEO article data
    seoArticle: item.seoArticle,
    seoKeywords: item.seoKeywords,
  }
}

export async function getLatestHubbleFromApi(limit = 12): Promise<HubbleItem[]> {
  // Try AWS API first, fallback to local Next.js API
  const awsApiUrl = process.env.NEXT_PUBLIC_AWS_API_URL
  const localApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/hubble`
  
  const url = awsApiUrl ? `${awsApiUrl}/hubble?limit=${encodeURIComponent(String(limit))}` : `${localApiUrl}?limit=${encodeURIComponent(String(limit))}`

  const res = await fetch(url, { 
    next: { 
      revalidate: 3600, // 1-hour cache for Hubble data (weekly updates)
      tags: ['hubble-latest', 'sitemap-data']
    },
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200, stale-if-error=86400',
    },
  })
  if (!res.ok) {
    throw new Error(`Hubble API error: ${res.status}`)
  }
  const json = (await res.json()) as HubbleApiLatestResponse
  const items = Array.isArray(json.items) ? json.items : []
  return items.map(mapApiItemToHubble)
}

export async function getAllAvailableHubbleFromApi(): Promise<HubbleItem[]> {
  const allHubble = await getLatestHubbleFromApi(100)
  
  // Filter out future dates - only include past and current dates
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  console.log(`🔭 Hubble API - Today: ${today}, Raw items: ${allHubble.length}`)
  
  const filteredHubble = allHubble.filter(item => {
    const itemDate = item.pubDate.split('T')[0] // Extract date part
    const isValid = itemDate <= today
    if (!isValid) {
      console.log(`🚫 Hubble API filtering out future date: ${itemDate}`)
    }
    return isValid
  })
  
  console.log(`✅ Hubble API - Valid items after filtering: ${filteredHubble.length}`)
  return filteredHubble
}

export async function getHubbleByGuidFromApi(guid: string): Promise<HubbleItem | null> {
  // Try AWS API first, fallback to local Next.js API
  const awsApiUrl = process.env.NEXT_PUBLIC_AWS_API_URL
  const localApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/hubble`
  
  const url = awsApiUrl ? `${awsApiUrl}/hubble?guid=${encodeURIComponent(guid)}&limit=1` : `${localApiUrl}?guid=${encodeURIComponent(guid)}&limit=1`

  const res = await fetch(url, { 
    next: { 
      revalidate: 3600, // 1-hour cache for individual articles
      tags: [`hubble-${guid}`]
    },
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200, stale-if-error=86400',
    },
  })
  if (!res.ok) return null
  const json = (await res.json()) as HubbleApiLatestResponse
  const item = Array.isArray(json.items) && json.items.length > 0 ? json.items[0] : undefined
  return item ? mapApiItemToHubble(item) : null
}

export async function getPreviousHubbleFromApi(beforeDate: string, count: number = 3): Promise<HubbleItem[]> {
  const all = await getLatestHubbleFromApi(100)
  const list = all
    .filter((a) => a.pubDate < beforeDate)
    .sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1))
    .slice(0, count)
  return list
}

export async function getNeighborsHubbleFromApi(pubDate: string): Promise<{ newer?: HubbleItem; older?: HubbleItem }> {
  const all = await getLatestHubbleFromApi(100)
  // all is newest first
  const idx = all.findIndex((a) => a.pubDate === pubDate)
  if (idx === -1) return {}
  const newer = idx > 0 ? all[idx - 1] : undefined // more recent
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined // previous week
  return { newer, older }
}
