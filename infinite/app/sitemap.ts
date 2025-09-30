import { MetadataRoute } from 'next'
import { getAllAvailableFromApi } from '@/lib/content-api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example'
  
  // Get all APOD dates for sitemap
  const apods = await getAllAvailableFromApi().catch(() => [])
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
  
  // Dynamic APOD pages
  const apodPages: MetadataRoute.Sitemap = apods.map((apod) => ({
    url: `${baseUrl}/apod/${apod.date}`,
    lastModified: new Date(apod.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
  
  return [...staticPages, ...apodPages]
}