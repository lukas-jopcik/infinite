import Link from "next/link"
import { getAllAvailableFromApi } from "@/lib/content-api"
import { ApodCard } from "@/components/ApodCard"

interface CategoryPageProps {}

export async function generateMetadata() {
  return {
    title: "Kategórie | Infinite - Astronomické objavy",
    description: "Preskúmajte astronomické objavy podľa kategórií - kométy, planéty, galaxie, hviezdy a ďalšie fascinujúce vesmírne fenomény.",
    openGraph: {
      title: "Kategórie | Infinite - Astronomické objavy",
      description: "Preskúmajte astronomické objavy podľa kategórií - kométy, planéty, galaxie, hviezdy a ďalšie fascinujúce vesmírne fenomény.",
      type: "website",
    },
  }
}

function categorizeApods(apods: any[]) {
  const categories = {
    komety: { name: "Kométy", items: [], description: "Fascinujúce návštevníci z vonkajších oblastí slnečnej sústavy" },
    planety: { name: "Planéty", items: [], description: "Naše planetárne susedy a ich tajomstvá" },
    galaxie: { name: "Galaxie", items: [], description: "Obrovské hviezdne ostrovy vo vesmíre" },
    hviezdy: { name: "Hviezdy", items: [], description: "Žiarivé kozmické telesá a ich životné cykly" },
    hmloviny: { name: "Hmloviny", items: [], description: "Kozmické mraky plynu a prachu" },
    cierne_diery: { name: "Čierne diery", items: [], description: "Extrémne gravitačné objekty" },
    slnečna_sustava: { name: "Slnečná sústava", items: [], description: "Náš domov vo vesmíre" },
    pozorovanie: { name: "Pozorovanie", items: [], description: "Ako pozorovať vesmír" },
  }

  apods.forEach(apod => {
    const keywords = apod.seoKeywords || []
    const title = apod.title.toLowerCase()
    const explanation = apod.explanation?.toLowerCase() || ""

    // Categorize based on keywords and content
    if (keywords.some(k => k.toLowerCase().includes('kométa')) || title.includes('kométa')) {
      categories.komety.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('planéta') || k.toLowerCase().includes('saturn') || k.toLowerCase().includes('mars') || k.toLowerCase().includes('jupiter')) || 
        title.includes('planéta') || title.includes('saturn') || title.includes('mars')) {
      categories.planety.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('galaxia') || k.toLowerCase().includes('galaxy')) || 
        title.includes('galaxia') || explanation.includes('galaxia')) {
      categories.galaxie.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('hviezda') || k.toLowerCase().includes('star')) || 
        title.includes('hviezda') || explanation.includes('hviezda')) {
      categories.hviezdy.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('hmlovina') || k.toLowerCase().includes('nebula')) || 
        title.includes('hmlovina') || explanation.includes('hmlovina')) {
      categories.hmloviny.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('čierna diera') || k.toLowerCase().includes('black hole')) || 
        title.includes('čierna diera') || explanation.includes('čierna diera')) {
      categories.cierne_diery.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('slnečná sústava') || k.toLowerCase().includes('slnko')) || 
        title.includes('slnečná sústava') || title.includes('slnko')) {
      categories.slnečna_sustava.items.push(apod)
    }
    if (keywords.some(k => k.toLowerCase().includes('pozorovanie') || k.toLowerCase().includes('teleskop')) || 
        title.includes('pozorovanie') || explanation.includes('pozorovanie')) {
      categories.pozorovanie.items.push(apod)
    }
  })

  return categories
}

export default async function CategoryPage({}: CategoryPageProps) {
  const apods = await getAllAvailableFromApi().catch(() => [])
  const categories = categorizeApods(apods)

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Kategórie astronomických objavov</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Preskúmajte fascinujúce vesmírne fenomény zoradené podľa kategórií. 
            Každá kategória obsahuje súvisiace články a objavy z oblasti astronómie.
          </p>
        </header>

        <nav aria-label="Breadcrumb" className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(categories).map(([key, category]) => (
            <div
              key={key}
              className="bg-black/20 border border-white/10 rounded-lg p-6 hover:bg-black/30 transition-colors"
            >
              <h2 className="text-2xl font-bold mb-3">{category.name}</h2>
              <p className="text-gray-400 mb-4">{category.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                {category.items.length} článkov
              </div>
              {category.items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-300">Najnovšie články:</h3>
                  <div className="space-y-1">
                    {category.items.slice(0, 3).map((item) => (
                      <Link
                        key={item.date}
                        href={`/apod/${item.date}`}
                        className="block text-sm text-blue-400 hover:text-blue-300 transition-colors truncate hover:underline"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/kategorie/${key}`}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                    >
                      Zobraziť všetky ({category.items.length}) →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Späť na všetky články</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
