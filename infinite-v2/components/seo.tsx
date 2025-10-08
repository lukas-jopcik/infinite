import type { Metadata } from "next"

interface SEOProps {
  title: string
  description: string
  image?: string
  type?: "website" | "article"
  publishedTime?: string
  author?: string
  section?: string
}

export function generateSEO({
  title,
  description,
  image = "/space-discovery.jpg",
  type = "website",
  publishedTime,
  author,
  section,
}: SEOProps): Metadata {
  const fullTitle = `${title} | Infinite`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(type === "article" &&
        publishedTime && {
          publishedTime,
          authors: author ? [author] : undefined,
          section,
        }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  }
}
