import { notFound } from "next/navigation"
import Image from "next/image"
import { ArticlesAPI, Article, ArticleDetail, getMockArticles } from "@/lib/api"
import { generateArticleMetadata } from "@/lib/seo"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ArticleStructuredData, BreadcrumbStructuredData } from "@/components/structured-data"
import { ArticlePageWrapper, SocialSharingSection } from "@/components/article-page-wrapper"
import { AdContainer } from "@/components/ad-manager"
import { Calendar, ExternalLink } from "lucide-react"
import type { Metadata } from "next"

interface DiscoveryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DiscoveryPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const response = await ArticlesAPI.getAllArticles(100)
    const article = response.articles.find(a => a.slug === slug)

    if (!article) {
      return {
        title: "Objav nenájdený | Infinite",
        description: "Požadovaný objav nebol nájdený.",
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
      title: "Objav nenájdený | Infinite",
      description: "Požadovaný objav nebol nájdený.",
    }
  }
}

export default async function DiscoveryPage({ params }: DiscoveryPageProps) {
  const { slug } = await params
  
  let article: ArticleDetail | null = null
  let relatedDiscoveries: Article[] = []
  
  try {
    // First get all articles to find the article and related discoveries
    const response = await ArticlesAPI.getAllArticles(100)
    const basicArticle = response.articles.find(a => a.slug === slug)
    
    if (basicArticle) {
      // Get the full article data with content, sections, and FAQ
      article = await ArticlesAPI.getArticleById(basicArticle.id)
      
      if (article) {
        relatedDiscoveries = response.articles
          .filter(a => a.category === "objav-dna" && a.slug !== slug)
          .slice(0, 3)
      }
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    // Fallback to mock data if API fails
    const mockArticles = getMockArticles()
    article = mockArticles.find(a => a.slug === slug) as ArticleDetail || null
    relatedDiscoveries = mockArticles.filter(a => a.category === "objav-dna" && a.slug !== slug).slice(0, 3)
  }

  if (!article || article.category !== "objav-dna") {
    notFound()
  }

  return (
    <ArticlePageWrapper article={article}>
      <div className="flex flex-col">
        <ScrollToTop />
        
        {/* Structured Data */}
        <ArticleStructuredData 
          article={{
            title: article.title,
            description: article.perex,
            slug: article.slug,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            originalDate: article.originalDate,
            author: article.author,
            category: article.category,
            tags: article.tags,
          }}
        />
        <BreadcrumbStructuredData 
          items={[
            { name: "Domov", url: "/" },
            { name: "Objav dňa", url: "/kategoria/objav-dna" },
            { name: article.title, url: `/objav-dna/${article.slug}` },
          ]}
        />

      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Domov", href: "/" },
              { label: "Objav dňa", href: "/kategoria/objav-dna" },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      {/* Discovery Content */}
      <article className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Date Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          <Calendar className="h-4 w-4" />
          <time dateTime={article.originalDate || article.publishedAt}>
            Objav dňa –{" "}
            {new Date(article.originalDate || article.publishedAt).toLocaleDateString("sk-SK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-balance text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          {article.title}
        </h1>

        {/* Main Image - Larger for discoveries */}
        <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.imageUrl || "/placeholder.svg"}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Description */}
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-pretty text-xl leading-relaxed text-muted-foreground">{article.perex}</p>
        </div>

        {/* Article Ad */}
        <AdContainer position="article" />

        {/* Article Sections */}
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
          url={`https://infinite.sk/objav-dna/${article.slug}`}
        />

        {/* Newsletter CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-accent/5 to-accent/10 p-8 text-center">
          <h3 className="mb-2 text-2xl font-bold text-foreground">Nenechaj si ujsť žiadny objav</h3>
          <p className="mb-6 text-muted-foreground">Dostávaj Objav dňa priamo do svojej schránky každé ráno.</p>
          <NewsletterSignup />
        </div>
      </article>

      {/* Related Discoveries */}
      {relatedDiscoveries.length > 0 && (
        <section className="border-t border-border bg-card/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-foreground">Ďalšie objavy</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedDiscoveries.map((discovery) => (
                <ArticleCard 
                  key={discovery.slug} 
                  slug={discovery.slug}
                  title={discovery.title}
                  perex={discovery.perex}
                  category={discovery.category}
                  date={discovery.originalDate || discovery.publishedAt}
                  image={discovery.imageUrl || "/placeholder.svg"}
                  imageAlt={discovery.title}
                  author={discovery.author}
                  source="Infinite AI"
                  type="discovery"
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
