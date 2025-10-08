import { getLatestArticles } from "@/lib/mock-data"
import { generateSEO } from "@/components/seo"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Star, TrendingUp } from "lucide-react"

export const metadata = generateSEO({
  title: "Týždenný výber",
  description: "Kurátorovaný výber najlepších vesmírnych objavov a článkov z tohto týždňa.",
})

export default function WeeklyPicksPage() {
  const weeklyPicks = getLatestArticles(6)

  const currentWeek = new Date().toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Domov", href: "/" }, { label: "Týždenný výber" }]} />
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/50 to-transparent py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <Star className="h-4 w-4" />
            <span>Kurátorovaný výber</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">Týždenný výber</h1>
          <p className="mb-2 max-w-2xl text-lg text-muted-foreground">
            Najlepšie vesmírne objavy a články z tohto týždňa vybrané redakciou Infinite.
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Aktualizované: {currentWeek}</span>
          </p>
        </div>
      </div>

      {/* Featured Pick */}
      {weeklyPicks.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Objav týždňa</h2>
            <p className="text-muted-foreground">Najvýznamnejší objav, ktorý tento týždeň ohromil svet astronómie</p>
          </div>
          <div className="mb-12 overflow-hidden rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-1">
            <ArticleCard {...weeklyPicks[0]} />
          </div>

          {/* Other Picks */}
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">Ďalšie výbery týždňa</h2>
            <p className="text-muted-foreground">Články a objavy, ktoré stoja za prečítanie</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {weeklyPicks.slice(1).map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </div>
      </section>
    </div>
  )
}
