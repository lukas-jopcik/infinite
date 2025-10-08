import { notFound } from "next/navigation"
import { ArticlesAPI, Article } from "@/lib/api"
import { generateCategoryMetadata } from "@/lib/seo"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { CategoryBadge } from "@/components/category-badge"
import type { Metadata } from "next"

const categories = [
  { name: "Objav dňa", slug: "objav-dna", description: "Denné objavy a vizuálne snímky z vesmíru" },
  { name: "Vysvetlenia", slug: "vysvetlenia", description: "Vzdelávacie články o vesmíre a astronómii" },
  { name: "Komunita", slug: "komunita", description: "Príspevky a diskusie z astronomickej komunity" },
  {
    name: "Deti & Vesmír",
    slug: "deti-a-vesmir",
    description: "Zábavné a vzdelávacie články o vesmíre pre deti",
  },
  { name: "Týždenný výber", slug: "tyzdenny-vyber", description: "Kurátorovaný výber najlepších objavov týždňa" },
]

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return {
      title: "Kategória nenájdená | Infinite",
      description: "Požadovaná kategória nebola nájdená.",
    }
  }

  return generateCategoryMetadata(slug, category.description)
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  // Fetch articles from API
  let articles: Article[] = []
  
  try {
    const response = await ArticlesAPI.getAllArticles(100) // Get more articles to ensure we have enough
    // Filter articles by category
    articles = response.articles.filter(article => article.category === slug)
  } catch (error) {
    console.error('Error fetching articles:', error)
    // Fallback to empty array if API fails
    articles = []
  }

  return (
    <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Domov", href: "/" }, { label: category.name }]} />
        </div>
      </div>

      {/* Category Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/50 to-transparent py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <CategoryBadge category={slug} className="text-base" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">{category.name}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {/* Articles Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard 
                key={article.slug} 
                slug={article.slug}
                title={article.title}
                perex={article.perex}
                category={article.category}
                     date={article.originalDate || article.publishedAt}
                image={article.imageUrl || "/placeholder.svg"}
                imageAlt={article.title}
                type={article.type as "article" | "discovery"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">V tejto kategórii zatiaľ nie sú žiadne články.</p>
          </div>
        )}
      </section>
    </div>
  )
}
