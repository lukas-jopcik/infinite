import type { MetadataRoute } from 'next'
import { getAllAvailableFromApi } from '@/lib/content-api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example'
  const items: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
  ]
  try {
    const apods = await getAllAvailableFromApi()
    for (const a of apods.slice(0, 100)) {
      items.push({ url: `${base}/apod/${a.date}`, changeFrequency: 'weekly', priority: 0.8 })
    }
  } catch {}
  return items
}
