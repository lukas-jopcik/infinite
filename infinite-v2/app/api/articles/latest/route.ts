import { NextRequest, NextResponse } from 'next/server'
import { ArticlesAPI } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const articles = await ArticlesAPI.getLatestArticles(limit)
    
    return NextResponse.json({
      articles,
      total: articles.length
    })
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest articles' },
      { status: 500 }
    )
  }
}
