import { getAllAvailableFromApi } from '@/lib/content-api'
import { formatDate } from '@/lib/date'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example'
  const apods = await getAllAvailableFromApi().catch(() => [])
  
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Infinite - NASA Fotka dňa v slovenčine</title>
    <description>Denné objavy vesmíru – preklady APOD, dlhšie články v slovenčine a obrázky v kvalite.</description>
    <link>${baseUrl}</link>
    <language>sk</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${apods.map(apod => `
    <item>
      <title><![CDATA[${apod.title}]]></title>
      <description><![CDATA[${apod.explanation?.substring(0, 500)}...]]></description>
      <link>${baseUrl}/apod/${apod.date}</link>
      <guid>${baseUrl}/apod/${apod.date}</guid>
      <pubDate>${new Date(apod.date).toUTCString()}</pubDate>
      <enclosure url="${apod.hdurl || apod.url}" type="image/jpeg"/>
    </item>
    `).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
    },
  })
}
