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
      url: `${baseUrl}/kategoria/deti-a-vesmir`,
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
    // Fetch articles from all categories
    const [objavDnaResponse, komunitaResponse, detiResponse, tyzdennyResponse] = await Promise.all([
      ArticlesAPI.getArticlesByCategory("objav-dna", 100).catch(() => ({ articles: [] })),
      ArticlesAPI.getArticlesByCategory("komunita", 50).catch(() => ({ articles: [] })),
      ArticlesAPI.getArticlesByCategory("deti-a-vesmir", 50).catch(() => ({ articles: [] })),
      ArticlesAPI.getArticlesByCategory("tyzdenny-vyber", 50).catch(() => ({ articles: [] })),
    ])

    // Generate sitemap entries for all articles
    const allArticles = [
      ...objavDnaResponse.articles,
      ...komunitaResponse.articles,
      ...detiResponse.articles,
      ...tyzdennyResponse.articles,
    ]

    const articlePages: MetadataRoute.Sitemap = allArticles.map((article) => {
      // Use correct URL structure based on category
      const basePath = article.category === 'tyzdenny-vyber' ? 'tyzdenny-vyber' : 'objav-dna'
      return {
        url: `${baseUrl}/${basePath}/${article.slug}`,
        lastModified: new Date(article.originalDate || article.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }
    })

    return [...staticPages, ...articlePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages only if API fails
    return staticPages
  }
}
