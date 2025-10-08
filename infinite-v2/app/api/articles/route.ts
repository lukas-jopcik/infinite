import { NextRequest, NextResponse } from 'next/server'
import { ArticlesAPI } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    
    const response = await ArticlesAPI.getAllArticles(limit)
    
    let articles = response?.articles || []
    
    // Ensure articles is an array before sorting
    if (Array.isArray(articles)) {
      // Sort articles by originalDate (newest first)
      articles.sort((a, b) => {
        const dateA = new Date(a.originalDate || a.publishedAt)
        const dateB = new Date(b.originalDate || b.publishedAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      // Filter by category if specified
      if (category) {
        articles = articles.filter(article => article.category === category)
      }
    }
    
    return NextResponse.json({
      articles,
      total: articles.length,
      hasMore: response.lastKey ? true : false
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
