"use client"

import { Article } from "@/lib/api"
import { ArticleCard } from "@/components/article-card"

interface CategoryArticlesSimpleProps {
  category: string
  initialArticles: Article[]
  initialLastKey?: string
  initialCount: number
}

export function CategoryArticlesSimple({ 
  category, 
  initialArticles, 
  initialLastKey, 
  initialCount 
}: CategoryArticlesSimpleProps) {
  // Add safety checks for props
  if (!category) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-lg text-muted-foreground">Chyba: Kategória nie je definovaná.</p>
      </div>
    )
  }

  const articles = initialArticles || []
  const count = initialCount || 0

  return (
    <div className="space-y-8">
      {/* Articles Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.length > 0 ? articles.map((article) => (
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
        )) : (
          <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">Žiadne články na zobrazenie.</p>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="text-center text-sm text-muted-foreground">
        Zobrazené {articles.length} z {count} článkov
      </div>
    </div>
  )
}
