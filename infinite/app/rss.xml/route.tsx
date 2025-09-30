import { getApodRange } from "@/lib/nasa"
import { getDateRange } from "@/lib/date"

export async function GET() {
  const baseUrl = process.env.SITE_URL || "https://infinite.vercel.app"

  // Get last 30 APODs for RSS feed
  const { start, end } = getDateRange(30)
  const apods = await getApodRange({ start, end })

  // Sort by date descending
  apods.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const rssItems = apods
    .map((apod) => {
      const pubDate = new Date(apod.date).toUTCString()
      const link = `${baseUrl}/apod/${apod.date}`
      const description = apod.explanation.slice(0, 300) + "..."

      return `
    <item>
      <title><![CDATA[${apod.title}]]></title>
      <link>${link}</link>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid>${link}</guid>
      ${apod.media_type === "image" ? `<enclosure url="${apod.url}" type="image/jpeg" />` : ""}
    </item>`
    })
    .join("")

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Infinite - Nekonečné objavy, každý deň</title>
    <description>Objavujte vesmír každý deň s NASA Astronomy Picture of the Day</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>sk</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
