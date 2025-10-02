import Link from "next/link"
import { getAllAvailableFromApi } from "@/lib/content-api"
import { ApodCard } from "@/components/ApodCard"
import { notFound } from "next/navigation"

interface CategoryDetailPageProps {
  params: Promise<{
    category: string
  }>
}

const categoryConfig = {
  komety: {
    name: "Kométy",
    description: "Fascinujúce návštevníci z vonkajších oblastí slnečnej sústavy",
    keywords: ["kométa", "comet"],
    title: "Kométy - Návštevníci z vonkajších oblastí slnečnej sústavy"
  },
  planety: {
    name: "Planéty",
    description: "Naše planetárne susedy a ich tajomstvá",
    keywords: ["planéta", "saturn", "mars", "jupiter", "venus", "mercury"],
    title: "Planéty - Naši susedia vo vesmíre"
  },
  galaxie: {
    name: "Galaxie",
    description: "Obrovské hviezdne ostrovy vo vesmíre",
    keywords: ["galaxia", "galaxy"],
    title: "Galaxie - Hviezdne ostrovy vo vesmíre"
  },
  hviezdy: {
    name: "Hviezdy",
    description: "Žiarivé kozmické telesá a ich životné cykly",
    keywords: ["hviezda", "star", "supernova"],
    title: "Hviezdy - Žiarivé kozmické telesá"
  },
  hmloviny: {
    name: "Hmloviny",
    description: "Kozmické mraky plynu a prachu",
    keywords: ["hmlovina", "nebula"],
    title: "Hmloviny - Kozmické mraky plynu a prachu"
  },
  cierne_diery: {
    name: "Čierne diery",
    description: "Extrémne gravitačné objekty",
    keywords: ["čierna diera", "black hole"],
    title: "Čierne diery - Extrémne gravitačné objekty"
  },
  slnečna_sustava: {
    name: "Slnečná sústava",
    description: "Náš domov vo vesmíre",
    keywords: ["slnečná sústava", "slnko", "solar system"],
    title: "Slnečná sústava - Náš domov vo vesmíre"
  },
  pozorovanie: {
    name: "Pozorovanie",
    description: "Ako pozorovať vesmír",
    keywords: ["pozorovanie", "teleskop", "observation"],
    title: "Pozorovanie vesmíru - Ako objavovať kozmické tajomstvá"
  }
}

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { category } = await params
  const config = categoryConfig[category as keyof typeof categoryConfig]
  if (!config) {
    return {
      title: "Kategória nenájdená | Infinite",
      description: "Požadovaná kategória sa nenašla.",
    }
  }

  return {
    title: `${config.title} | Infinite`,
    description: config.description,
    openGraph: {
      title: `${config.title} | Infinite`,
      description: config.description,
      type: "website",
    },
  }
}

function filterApodsByCategory(apods: any[], config: any) {
  if (!config) return []

  return apods.filter(apod => {
    const keywords = apod.seoKeywords || []
    const title = apod.title.toLowerCase()
    const explanation = apod.explanation?.toLowerCase() || ""

    return config.keywords.some(keyword => 
      keywords.some((k: string) => k.toLowerCase().includes(keyword)) ||
      title.includes(keyword) ||
      explanation.includes(keyword)
    )
  })
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { category } = await params
  const config = categoryConfig[category as keyof typeof categoryConfig]
  if (!config) {
    notFound()
  }

  const apods = await getAllAvailableFromApi().catch(() => [])
  const categoryApods = filterApodsByCategory(apods, params.category)

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Domov
            </Link>
            <span className="text-gray-500">/</span>
            <Link href="/kategorie" className="text-gray-400 hover:text-white transition-colors">
              Kategórie
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-white">{config.name}</span>
          </div>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{config.name}</h1>
          <p className="text-xl text-gray-400 max-w-3xl">
            {config.description}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {categoryApods.length} článkov v tejto kategórii
          </div>
        </header>

        {categoryApods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryApods.map((apod) => (
              <ApodCard key={apod.date} apod={apod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              V tejto kategórii zatiaľ nie sú žiadne články.
            </p>
            <Link 
              href="/kategorie" 
              className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Späť na kategórie</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link 
            href="/kategorie" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Späť na všetky kategórie</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
