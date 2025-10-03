import { NextRequest, NextResponse } from 'next/server'
import { parseString } from 'xml2js'
import { 
  HubbleItem, 
  HubbleApiResponse, 
  parseRssDate, 
  extractExcerpt, 
  extractImageFromDescription,
  parseImageUrl 
} from '@/lib/hubble'

const HUBBLE_RSS_URL = 'https://feeds.feedburner.com/esahubble/images/potw/'

interface RssItem {
  title: string[]
  link: string[]
  pubDate: string[]
  description: string[]
  guid: string[]
  category?: string[]
  'media:content'?: Array<{
    $: {
      url: string
      type: string
      width?: string
      height?: string
    }
  }>
  'media:credit'?: string[]
  'media:copyright'?: string[]
  'media:keywords'?: string[]
  enclosure?: Array<{
    $: {
      url: string
      type: string
      length?: string
    }
  }>
}

async function fetchHubbleRss(): Promise<RssItem[]> {
  try {
    const response = await fetch(HUBBLE_RSS_URL, {
      next: { revalidate: 3600 }, // 1 hour cache
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Infinite-Hubble-Bot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`)
    }

    const xmlText = await response.text()
    
    return new Promise((resolve, reject) => {
      parseString(xmlText, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        const items = result?.rss?.channel?.[0]?.item || []
        resolve(items)
      })
    })
  } catch (error) {
    console.error('Error fetching Hubble RSS:', error)
    throw error
  }
}

function mapRssItemToHubbleItem(item: RssItem): HubbleItem {
  const title = item.title?.[0] || ''
  const link = item.link?.[0] || ''
  const pubDate = parseRssDate(item.pubDate?.[0] || new Date().toISOString())
  const description = item.description?.[0] || ''
  const guid = item.guid?.[0] || ''
  const category = item.category || []

  // Extract excerpt from description
  const excerpt = extractExcerpt(description)

  // Process media content (images)
  let image_main: string | undefined
  let image_variants: Array<{ url: string; type: string; width?: number; height?: number }> = []

  if (item['media:content'] && item['media:content'].length > 0) {
    // Sort by resolution (width * height) to get the largest
    const sortedMedia = item['media:content']
      .map(media => ({
        url: parseImageUrl(media.$.url),
        type: media.$.type,
        width: media.$.width ? parseInt(media.$.width) : undefined,
        height: media.$.height ? parseInt(media.$.height) : undefined,
      }))
      .sort((a, b) => {
        const aRes = (a.width || 0) * (a.height || 0)
        const bRes = (b.width || 0) * (b.height || 0)
        return bRes - aRes
      })

    image_main = sortedMedia[0]?.url
    image_variants = sortedMedia.slice(1)
  } else if (item.enclosure && item.enclosure.length > 0) {
    // Fallback to enclosure
    const enclosure = item.enclosure[0]
    if (enclosure.$.type?.startsWith('image/')) {
      image_main = parseImageUrl(enclosure.$.url)
    }
  } else {
    // Fallback: try to extract image from description
    const imgFromDesc = extractImageFromDescription(description)
    if (imgFromDesc) {
      image_main = parseImageUrl(imgFromDesc)
    }
  }

  // Process credits and copyright
  const credit_raw = item['media:credit']?.[0]
  const copyright_raw = item['media:copyright']?.[0]
  const keywords = item['media:keywords']?.[0]?.split(',').map(k => k.trim()).filter(Boolean)

  return {
    guid,
    title,
    link,
    pubDate,
    description,
    excerpt,
    category,
    image_main,
    image_variants,
    credit_raw,
    copyright_raw,
    keywords,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const date = searchParams.get('date')

    console.log('🔭 Fetching Hubble RSS data...')
    const rssItems = await fetchHubbleRss()
    
    let hubbleItems = rssItems.map(mapRssItemToHubbleItem)

    // Filter by date if specified
    if (date) {
      hubbleItems = hubbleItems.filter(item => item.pubDate.startsWith(date))
    }

    // Sort by publication date (newest first)
    hubbleItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

    // Apply limit
    hubbleItems = hubbleItems.slice(0, limit)

    const response: HubbleApiResponse = {
      items: hubbleItems,
      count: hubbleItems.length,
      lastUpdated: new Date().toISOString(),
    }

    console.log(`✅ Hubble API - Fetched ${hubbleItems.length} items`)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('Hubble API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Hubble data' },
      { status: 500 }
    )
  }
}
