import { MetadataRoute } from 'next'
import { getAllAvailableFromApi } from '@/lib/content-api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example'
  
  // Get all APOD dates for sitemap
  const apods = await getAllAvailableFromApi().catch(() => [])
  
  // Filter out future dates and validate date format - only include past and current dates
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  console.log(`🗓️ Sitemap generation - Today: ${today}, Total APODs: ${apods.length}`)
  
  const validApods = apods.filter(apod => {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(apod.date)) {
      console.warn(`❌ Invalid date format in sitemap: ${apod.date}`)
      return false
    }
    
    // Only include past and current dates
    const isValid = apod.date <= today
    if (!isValid) {
      console.log(`🚫 Filtering out future date: ${apod.date} (today: ${today})`)
    }
    return isValid
  })
  
  console.log(`✅ Valid APODs after filtering: ${validApods.length}`)
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/kategorie`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rss.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/kategorie/komety`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/planety`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/galaxie`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/hviezdy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/hmloviny`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/cierne_diery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/slnečna_sustava`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategorie/pozorovanie`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
  
  // Dynamic APOD pages - only valid past dates
  const apodPages: MetadataRoute.Sitemap = validApods.map((apod) => {
    // Higher priority for recent articles (last 7 days)
    const articleDate = new Date(apod.date)
    const daysSinceArticle = Math.floor((Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24))
    const isRecent = daysSinceArticle <= 7
    
    return {
      url: `${baseUrl}/apod/${apod.date}`,
      lastModified: new Date(), // Use current time for better SEO
      changeFrequency: isRecent ? 'daily' : 'weekly', // More frequent updates for recent content
      priority: isRecent ? 0.9 : 0.8, // Higher priority for recent articles
    }
  })
  
  return [...staticPages, ...categoryPages, ...apodPages]
}