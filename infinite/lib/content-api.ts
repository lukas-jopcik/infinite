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
}

function mapApiItemToApod(item: ApiItem): Apod {
  // Prefer new curiosity-driven headline, fallback to old title
  const title = item.headline?.trim() || item.titleSk?.trim() || ""
  const explanation = item.slovakArticle?.trim() || ""
  const url = item.cachedImage?.url || item.hdImageUrl || item.imageUrl || ""
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
  }
}

export async function getLatestApodsFromApi(limit = 12): Promise<Apod[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod"
  const url = `${base}/api/latest?limit=${encodeURIComponent(String(limit))}`

  const res = await fetch(url, { 
    next: { revalidate: 300 }, // Restore normal 5-minute cache
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
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
  return getLatestApodsFromApi(100)
}

export async function getByDateFromApi(date: string): Promise<Apod | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod"
  const url = `${base}/api/latest?date=${encodeURIComponent(date)}&limit=1`

  const res = await fetch(url, { 
    next: { revalidate: 300 }, // Restore normal 5-minute cache
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
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
