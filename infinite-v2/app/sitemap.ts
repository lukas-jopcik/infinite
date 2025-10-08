import { MetadataRoute } from 'next'
import { ArticlesAPI } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://infinite.sk'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/kategoria/objav-dna`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kategoria/vysvetlenia`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategoria/deti-vesmir`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kategoria/komunita`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hladat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/o-projekte`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tyzdenny-vyber`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  try {
    // Fetch all articles
    const articles = await ArticlesAPI.getAllArticles()
    
    // Generate sitemap entries for articles
    const articlePages: MetadataRoute.Sitemap = articles.articles.map((article) => ({
      url: `${baseUrl}/objav-dna/${article.slug}`,
      lastModified: new Date(article.originalDate || article.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...articlePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages only if API fails
    return staticPages
  }
}
