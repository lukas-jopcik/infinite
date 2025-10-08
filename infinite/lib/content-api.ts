import type { Apod } from "@/lib/nasa"

type ApiLatestResponse = {
  items: ApiItem[]
  count: number
}

type ApiItem = {
  date: string
  titleSk?: string
  headline?: string           // New curiosity-driven Slovak headline
  headlineEN?: string         // New curiosity-driven English headline
  slovakArticle?: string
  imageUrl?: string
  hdImageUrl?: string
  mediaType?: string
  seoKeywords?: string[]
  contentQuality?: number
  cachedImage?: {
    url?: string
    bucket?: string
    key?: string
    contentType?: string
    originalUrl?: string
  }
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

function mapApiItemToApod(item: ApiItem): Apod {
  // Prefer new curiosity-driven headline, fallback to old title
  const title = item.headline?.trim() || item.titleSk?.trim() || ""
  const explanation = item.slovakArticle?.trim() || ""
  
  // Prioritize cached images, but fallback to NASA URLs if cached images fail
  let url = item.cachedImage?.url || item.hdImageUrl || item.imageUrl || ""
  
  // TEMPORARY FIX: Bypass cached image for 2025-10-01 (Veil Nebula image mismatch)
  if (item.date === "2025-10-01") {
    // Use original NASA URL instead of cached image for this specific date
    url = item.hdImageUrl || item.imageUrl || ""
    console.log("🔧 Using original NASA URL for 2025-10-01 to fix image mismatch")
  }
  
  const media_type = (item.mediaType as Apod["media_type"]) || "image"

  return {
    date: item.date,
    title,
    explanation,
    url,
    hdurl: item.hdImageUrl,
    media_type,
    // Store both headlines for potential future use
    headlineEN: item.headlineEN?.trim(),
    // SEO article data
    seoArticle: item.seoArticle,
    seoKeywords: item.seoKeywords,
  }
}

export async function getLatestApodsFromApi(limit = 12): Promise<Apod[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod"
  const url = `${base}/api/latest?limit=${encodeURIComponent(String(limit))}`

  const res = await fetch(url, { 
    next: { 
      revalidate: 300, // 5-minute cache for sitemap freshness
      tags: ['apod-latest', 'sitemap-data'] // Multiple tags for better cache invalidation
    },
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600, stale-if-error=86400',
    },
  })
  if (!res.ok) {
    throw new Error(`Content API error: ${res.status}`)
  }
  const json = (await res.json()) as ApiLatestResponse
  const items = Array.isArray(json.items) ? json.items : []
  return items.map(mapApiItemToApod)
}

export async function getAllAvailableFromApi(): Promise<Apod[]> {
  const allApods = await getLatestApodsFromApi(100)
  
  // Filter out future dates - only include past and current dates
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  console.log(`📡 API - Today: ${today}, Raw APODs: ${allApods.length}`)
  
  const filteredApods = allApods.filter(apod => {
    const isValid = apod.date <= today
    if (!isValid) {
      console.log(`🚫 API filtering out future date: ${apod.date}`)
    }
    return isValid
  })
  
  console.log(`✅ API - Valid APODs after filtering: ${filteredApods.length}`)
  return filteredApods
}

export async function getByDateFromApi(date: string): Promise<Apod | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod"
  const url = `${base}/api/latest?date=${encodeURIComponent(date)}&limit=1`

  const res = await fetch(url, { 
    next: { 
      revalidate: 3600, // 1-hour cache for individual articles
      tags: [`apod-${date}`]
    },
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200, stale-if-error=86400',
    },
  })
  if (!res.ok) return null
  const json = (await res.json()) as ApiLatestResponse
  const item = Array.isArray(json.items) && json.items.length > 0 ? json.items[0] : undefined
  return item ? mapApiItemToApod(item) : null
}

export async function getPreviousFromApi(beforeDate: string, count: number = 3): Promise<Apod[]> {
  const all = await getLatestApodsFromApi(100)
  const list = all
    .filter((a) => a.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, count)
  return list
}

export async function getNeighborsFromApi(date: string): Promise<{ newer?: Apod; older?: Apod }> {
  const all = await getLatestApodsFromApi(100)
  // all is newest first
  const idx = all.findIndex((a) => a.date === date)
  if (idx === -1) return {}
  const newer = idx > 0 ? all[idx - 1] : undefined // more recent
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined // previous day
  return { newer, older }
}
