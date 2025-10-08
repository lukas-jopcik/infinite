import { notFound } from "next/navigation"
import Image from "next/image"
import { getArticleBySlug, getArticlesByCategory } from "@/lib/mock-data"
import { generateSEO } from "@/components/seo"
import { CategoryBadge } from "@/components/category-badge"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ArticleBody } from "@/components/article-body"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Calendar, ExternalLink } from "lucide-react"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return {
      title: "Článok nenájdený",
    }
  }

  return generateSEO({
    title: article.title,
    description: article.perex,
    image: article.image,
    type: "article",
    publishedTime: article.date,
    author: article.author,
    section: article.category,
  })
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = getArticlesByCategory(article.category)
    .filter((a) => a.slug !== slug)
    .slice(0, 3)

  return (
    <div className="flex flex-col">
      <ScrollToTop />

      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Domov", href: "/" },
              {
                label: article.category
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" "),
                href: `/kategoria/${article.category}`,
              },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      {/* Article Header */}
      <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <CategoryBadge category={article.category} />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString("sk-SK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold leading-tight text-foreground lg:text-5xl">
            {article.title}
          </h1>

          <p className="text-pretty text-xl leading-relaxed text-muted-foreground">{article.perex}</p>
        </header>

        {/* Hero Image */}
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.imageAlt}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Article Content */}
        <ArticleBody content={article.content} />

        {/* Source */}
        {article.source && (
          <div className="mt-8 rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>
                Zdroj: <span className="font-medium text-foreground">{article.source}</span>
              </span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-2xl font-bold text-foreground">Chceš viac objavov ako tento?</h3>
          <p className="mb-6 text-muted-foreground">Prihlás sa na odber Objavu dňa.</p>
          <NewsletterSignup />
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-border bg-card/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-foreground">Súvisiace články</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
