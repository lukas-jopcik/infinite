import { notFound } from "next/navigation"
import Image from "next/image"
import { ArticlesAPI, getMockArticles } from "@/lib/api"
import { generateArticleMetadata } from "@/lib/seo"
import { CategoryBadge } from "@/components/category-badge"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ArticleBody } from "@/components/article-body"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ArticlePageWrapper, SocialSharingSection } from "@/components/article-page-wrapper"
import { AdContainer } from "@/components/ad-manager"
import { Calendar, ExternalLink } from "lucide-react"
import type { Metadata } from "next"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const response = await ArticlesAPI.getAllArticles(100)
    const article = response.articles.find(a => a.slug === slug)

    if (!article) {
      return {
        title: "Článok nenájdený | Infinite",
        description: "Požadovaný článok nebol nájdený.",
      }
    }

    return generateArticleMetadata({
      title: article.title,
      description: article.perex,
      slug: article.slug,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt,
      originalDate: article.originalDate,
      author: article.author,
      category: article.category,
      tags: article.tags,
    })
  } catch {
    return {
      title: "Článok nenájdený | Infinite",
      description: "Požadovaný článok nebol nájdený.",
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  
  let article = null
  let relatedArticles = []
  
  try {
    // First get all articles to find the article and related articles
    const response = await ArticlesAPI.getAllArticles(100)
    const basicArticle = response.articles.find(a => a.slug === slug)
    
    if (basicArticle) {
      // Get the full article data with content, sections, and FAQ
      article = await ArticlesAPI.getArticleById(basicArticle.id)
      
      if (article) {
        relatedArticles = response.articles
          .filter(a => a.category === article.category && a.slug !== slug)
          .slice(0, 3)
      }
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    // Fallback to mock data if API fails
    const mockArticles = getMockArticles()
    article = mockArticles.find(a => a.slug === slug) || null
    relatedArticles = mockArticles.filter(a => a.category === article?.category && a.slug !== slug).slice(0, 3)
  }

  if (!article) {
    notFound()
  }

  return (
    <ArticlePageWrapper article={article}>
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
                <time dateTime={article.originalDate || article.publishedAt}>
                  {new Date(article.originalDate || article.publishedAt).toLocaleDateString("sk-SK", {
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
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Article Ad */}
          <AdContainer position="article" />

          {/* Article Content */}
          {article.content && article.content.length > 0 && (
            <div className="mt-8 space-y-8">
              {article.content.map((section, index) => (
                <section key={index} className="prose prose-lg prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-foreground mb-4">{section.title}</h2>
                  <div className="text-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          {article.faq && article.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Často kladené otázky</h2>
              <div className="space-y-4">
                {article.faq.map((faq, index) => (
                  <div key={index} className="border border-border rounded-lg p-6 bg-card/50">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Source */}
          {article.source && (
            <div className="mt-8 rounded-lg border border-border bg-card/50 p-6">
              <div className="flex items-start gap-3">
                <ExternalLink className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="mb-1 text-sm font-medium text-foreground">Zdroj snímky</p>
                  <p className="text-sm text-muted-foreground">{article.source}</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <SocialSharingSection 
            articleSlug={article.slug}
            articleTitle={article.title}
            url={`https://infinite.sk/clanok/${article.slug}`}
          />

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
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard 
                    key={relatedArticle.slug} 
                    slug={relatedArticle.slug}
                    title={relatedArticle.title}
                    perex={relatedArticle.perex}
                    category={relatedArticle.category}
                    date={relatedArticle.originalDate || relatedArticle.publishedAt}
                    image={relatedArticle.imageUrl || "/placeholder.svg"}
                    imageAlt={relatedArticle.title}
                    author={relatedArticle.author}
                    source="Infinite AI"
                    type="article"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </ArticlePageWrapper>
  )
}
