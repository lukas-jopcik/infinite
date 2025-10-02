import type { Apod } from "./nasa"

export function generateApodMetadata(apod: Apod) {
  const title = `${apod.title} | Infinite`
  const description = (apod.explanation || "").slice(0, 160) + (apod.explanation?.length > 160 ? "..." : "")
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://infinite.example"
  const canonical = `${base}/apod/${apod.date}`
  const ogUrl = `${base}/apod/${apod.date}/opengraph-image`

  return {
    title,
    description,
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
