import type { Apod } from "./nasa"
import type { HubbleItem } from "./hubble"

export function generateApodMetadata(apod: Apod) {
  // Use SEO meta title/description if available, otherwise fallback to regular content
  const title = apod.seoArticle?.metaTitle 
    ? `${apod.seoArticle.metaTitle} | Infinite`
    : `${apod.title} | Infinite`
  
  const description = apod.seoArticle?.metaDescription 
    || (apod.explanation || "").slice(0, 160) + (apod.explanation?.length > 160 ? "..." : "")
  
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://infinite.example"
  const canonical = `${base}/objav-dna/${apod.date}`
  const ogUrl = `${base}/objav-dna/${apod.date}/opengraph-image`

  // Add keywords from SEO article
  const keywords = apod.seoKeywords?.join(', ') || ''

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Infinite",
      locale: "sk_SK",
      type: "article",
      publishedTime: apod.date,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: apod.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  }
}

export function generateHubbleMetadata(hubble: HubbleItem) {
  // Use SEO meta title/description if available, otherwise fallback to regular content
  const title = hubble.seoArticle?.metaTitle 
    ? `${hubble.seoArticle.metaTitle} | Infinite`
    : `${hubble.title} | Infinite`
  
  const description = hubble.seoArticle?.metaDescription 
    || hubble.excerpt.slice(0, 160) + (hubble.excerpt.length > 160 ? "..." : "")
  
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://infinite.example"
  const canonical = `${base}/objav-tyzdna/${hubble.guid}`
  const ogUrl = `${base}/objav-tyzdna/${hubble.guid}/opengraph-image`

  // Add keywords from SEO article
  const keywords = hubble.seoKeywords?.join(', ') || ''

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Infinite",
      locale: "sk_SK",
      type: "article",
      publishedTime: hubble.pubDate,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: hubble.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  }
}
