import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/date"
import { generateApodMetadata } from "@/lib/seo"
import { Prose } from "@/components/Prose"
import ArticleContent from "@/components/ArticleContent"
import { getByDateFromApi, getPreviousFromApi, getNeighborsFromApi } from "@/lib/content-api"
import { ApodCard } from "@/components/ApodCard"
import SourceLink from "@/components/SourceLink"
import DetailNav from "@/components/DetailNav"
import { OptimizedImage } from "@/components/OptimizedImage"
import { trackEvent } from "@/lib/analytics"

interface ApodDetailPageProps {
  params: {
    date: string
  }
}

export async function generateMetadata({ params }: ApodDetailPageProps) {
  const apod = await getByDateFromApi(params.date)
  if (!apod) {
    return {
      title: "APOD nenájdené | Infinite",
      description: "Požadovaný Astronomy Picture of the Day sa nenašiel.",
    }
  }
  return generateApodMetadata(apod)
}

export default async function ApodDetailPage({ params }: ApodDetailPageProps) {
  const apod = await getByDateFromApi(params.date)
  if (!apod) notFound()
  const previous = await getPreviousFromApi(apod.date, 3)
  const { newer, older } = await getNeighborsFromApi(apod.date)

  return (
    <article className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <nav aria-label="Breadcrumb">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8" aria-label="Späť na hlavnú stránku">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{apod.title}</h1>
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <time dateTime={apod.date} className="text-lg">{formatDate(apod.date)}</time>
            <span
              className="inline-flex items-center bg-black/30 border border-white/5 text-gray-200/90 text-xs px-2.5 py-0.5 rounded-md"
              aria-label="Článok generovaný AI"
              title="Text článku bol pripravený s pomocou AI"
            >
              AI generované
            </span>
          </div>
        </header>

        <div className="mb-8">
          {apod.media_type === "image" ? (
            <figure className="relative aspect-video rounded-lg overflow-hidden">
              <OptimizedImage
                src={apod.hdurl || apod.url}
                alt={`${apod.title} - Astronomická fotografia dňa ${apod.date}${apod.seoKeywords ? ` | ${apod.seoKeywords.slice(0, 3).join(', ')}` : ''}`}
                className="w-full h-full object-cover"
                priority={true}
              />
              <figcaption className="sr-only">{apod.title} - Astronomická fotografia dňa {apod.date}</figcaption>
            </figure>
          ) : (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={apod.url.replace("watch?v=", "embed/")}
                title={`${apod.title} - Astronomické video dňa ${apod.date}`}
                className="w-full h-full"
                allowFullScreen
                aria-label={`Video: ${apod.title} - Astronomické video dňa ${apod.date}`}
              />
            </div>
          )}
        </div>

        <div className="mb-8">
          <ArticleContent content={apod.explanation} />
        </div>

        {/* Enhanced JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: apod.title,
                datePublished: apod.date,
                dateModified: apod.date,
                image: apod.hdurl || apod.url,
                inLanguage: 'sk',
                isAccessibleForFree: true,
                author: { '@type': 'Organization', name: 'Infinite' },
                publisher: { 
                  '@type': 'Organization', 
                  name: 'Infinite',
                  url: 'https://infinite.example',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://infinite.example/logo.png'
                  }
                },
                mainEntityOfPage: `https://infinite.example/apod/${apod.date}`,
                articleSection: 'Astronómia',
                keywords: apod.seoKeywords?.join(', ') || '',
                description: apod.explanation?.slice(0, 160) || '',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Domov',
                    item: 'https://infinite.example'
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'APOD',
                    item: 'https://infinite.example'
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: apod.title,
                    item: `https://infinite.example/apod/${apod.date}`
                  }
                ]
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Infinite - Nekonečné objavy, každý deň',
                url: 'https://infinite.example',
                description: 'Objavujte vesmír každý deň s NASA Astronomy Picture of the Day',
                inLanguage: 'sk',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://infinite.example/search?q={search_term_string}',
                  'query-input': 'required name=search_term_string'
                }
              }
            ]),
          }}
        />

        <footer className="border-t border-[#1f1f1f] pt-6">
          <p className="text-sm text-gray-400">
            Zdroj:{" "}
            <SourceLink href={`https://apod.nasa.gov/apod/ap${apod.date.replace(/-/g, "").slice(2)}.html`} />
          </p>
        </footer>

        {previous.length > 0 && (
          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold mb-6">Súvisiace články</h2>
            <p className="text-gray-400 mb-6">
              Objavte ďalšie fascinujúce astronomické objavy a vesmírne fenomény.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {previous.map((p) => (
                <div key={p.date} role="listitem">
                  <ApodCard apod={p} />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                aria-label="Zobraziť všetky články"
              >
                <span>Zobraziť všetky články</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        <nav aria-label="Navigácia medzi článkami">
          <DetailNav
            newerHref={newer ? `/apod/${newer.date}` : undefined}
            olderHref={older ? `/apod/${older.date}` : undefined}
          />
        </nav>
      </div>
    </article>
  )
}
