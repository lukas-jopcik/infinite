import { getAllAvailableFromApi } from "@/lib/content-api"
import { getDateRange, subtractDays } from "@/lib/date"
import { ApodHero } from "@/components/ApodHero"
import dynamic from "next/dynamic"
import { ApodCard } from "@/components/ApodCard"
import { Pagination } from "@/components/Pagination"

// Lazy load Aurora with better loading state
const Aurora = dynamic(() => import("@/components/backgrounds/Aurora"), { 
  ssr: false, 
  loading: () => <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
})

interface HomePageProps {
  searchParams: {
    page?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 9

  // Optimize API call with error handling and caching
  const apods = await getAllAvailableFromApi().catch((error) => {
    console.error('Failed to fetch APOD data:', error)
    return []
  })
  
  const latestApod = apods.length > 0 ? apods[0] : undefined
  const rest = apods.length > 1 ? apods.slice(1) : []
  const startIdx = (page - 1) * pageSize
  const endIdx = startIdx + pageSize
  const listingApods = rest.slice(startIdx, endIdx)
  const hasNextPage = endIdx < rest.length
  const hasPrevPage = page > 1

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10">
        <Aurora colorStops={["#3A29FF", "#3A29FF", "#3A29FF"]} amplitude={0.2} blend={1} />
      </div>
      {page === 1 && latestApod ? (
        <ApodHero apod={latestApod} />
      ) : (
        page === 1 && (
          <section className="py-12 lg:py-20 relative z-10" role="alert" aria-live="polite">
            <div className="container mx-auto px-4">
              <div className="bg-black/60 border border-white/10 rounded-lg p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">Dáta sa nepodarilo načítať</h1>
                <p className="text-gray-300">Skús prosím obnoviť stránku neskôr. Obsah sa načítava z verejného API.</p>
              </div>
            </div>
          </section>
        )
      )}

      <section className="py-12" aria-labelledby="articles-heading">
        <div className="container mx-auto px-4">
          {page === 1 && <h2 id="articles-heading" className="text-2xl font-bold mb-8 text-center">Predchádzajúce objavy</h2>}

          {listingApods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Zoznam článkov">
              {listingApods.map((apod) => (
                <div key={apod.date} role="listitem">
                  <ApodCard apod={apod} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/40 border border-white/10 rounded-lg p-6 text-center text-gray-300">
              Žiadne položky na zobrazenie.
            </div>
          )}

          <nav aria-label="Stránkovanie">
            <Pagination currentPage={page} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
          </nav>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  const title = "Infinite | NASA Fotka dňa v slovenčine"
  const description = "Denné objavy vesmíru – preklady APOD, dlhšie články v slovenčine a obrázky v kvalite."
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://infinite.example"
  const ogImage = `${base}/og.png`
  return {
    title,
    description,
    alternates: { canonical: base },
    openGraph: {
      title,
      description,
      url: base,
      siteName: "Infinite",
      images: [{ url: ogImage }],
      locale: "sk_SK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}
