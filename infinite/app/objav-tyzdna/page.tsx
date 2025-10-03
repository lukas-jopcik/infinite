import { Metadata } from 'next'
import { getLatestHubbleFromApi } from '@/lib/hubble-api'
import { HubbleCard } from '@/components/HubbleCard'
import { Pagination } from '@/components/Pagination'

export const metadata: Metadata = {
  title: 'Objav Týždňa | Infinite',
  description: 'Objavte najnovšie obrázky z ESA Hubble Space Telescope. Každý týždeň nové fascinujúce pohľady do vesmíru s detailnými vysvetleniami.',
  keywords: ['ESA Hubble', 'Hubble Space Telescope', 'astronómia', 'vesmír', 'galaxie', 'hviezdy', 'nebulae'],
  openGraph: {
    title: 'Objav Týždňa | Infinite',
    description: 'Objavte najnovšie obrázky z ESA Hubble Space Telescope. Každý týždeň nové fascinujúce pohľady do vesmíru.',
    type: 'website',
  },
}

interface HubblePageProps {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function HubblePage({ searchParams }: HubblePageProps) {
  const { page } = await searchParams
  const currentPage = parseInt(page || '1')
  const itemsPerPage = 12
  
  try {
    const allHubble = await getLatestHubbleFromApi(100)
    const totalPages = Math.ceil(allHubble.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const hubbleItems = allHubble.slice(startIndex, endIndex)
    
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    return (
      <div className="min-h-screen bg-black">
        <main className="container mx-auto px-4 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Objav Týždňa
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Každý týždeň nové fascinujúce pohľady do vesmíru z Hubble Space Telescope. 
              Objavte galaxie, hviezdy, nebulae a ďalšie úžasné kozmické objekty.
            </p>
          </header>

          {hubbleItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" role="list" aria-label="Zoznam Hubble obrázkov týždňa">
                {hubbleItems.map((item) => (
                  <div key={item.guid} role="listitem">
                    <HubbleCard hubble={item} priority={currentPage === 1} />
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                basePath="/hubble"
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                Momentálne nie sú dostupné žiadne Hubble obrázky.
              </div>
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading Hubble page:', error)
    return (
      <div className="min-h-screen bg-black">
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">
              Chyba pri načítavaní Hubble obrázkov. Skúste to prosím neskôr.
            </div>
          </div>
        </main>
      </div>
    )
  }
}
