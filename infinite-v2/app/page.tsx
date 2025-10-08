import { ArticleHero } from "@/components/article-hero"
import { ArticleCard } from "@/components/article-card"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { ArticlesAPI, getMockArticles } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { generateHomepageMetadata } from "@/lib/seo"
import { WebsiteStructuredData } from "@/components/structured-data"
import { HomepageSkeleton } from "@/components/skeleton-loader"
import { Suspense } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = generateHomepageMetadata()

async function HomePageContent() {
  // Single API call to get all articles, then filter client-side
  let articles: any[] = [];
  
  try {
    const response = await ArticlesAPI.getAllArticles(50);
    articles = response?.articles || [];
    
    // Sort articles by originalDate (newest first) on client-side
    if (Array.isArray(articles)) {
      articles.sort((a, b) => {
        const dateA = new Date(a.originalDate || a.publishedAt)
        const dateB = new Date(b.originalDate || b.publishedAt)
        return dateB.getTime() - dateA.getTime()
      })
    }
  } catch (error) {
    console.log('Using mock data for development', error);
    articles = getMockArticles();
  }

  // Ensure articles is an array
  if (!Array.isArray(articles)) {
    articles = [];
  }

  // Filter articles by category
  const latestArticle = articles[0]
  const recentArticles = articles.slice(1, 7)
  const discoveryArticles = articles.filter(article => article.category === "objav-dna")
  const communityArticles = articles.filter(article => article.category === "komunita")
  const kidsArticles = articles.filter(article => article.category === "deti-a-vesmir")

  // Safety check - if no articles are available, show a message
  if (!latestArticle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-foreground mb-4">Žiadne články nie sú dostupné</h1>
        <p className="text-muted-foreground">Skúste to neskôr.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <WebsiteStructuredData />
      {/* Preload hero image for better LCP */}
      {latestArticle.imageUrl && (
        <link
          rel="preload"
          as="image"
          href={latestArticle.imageUrl}
          type="image/webp"
        />
      )}
      
      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ArticleHero
          slug={latestArticle.slug}
          title={latestArticle.title}
          perex={latestArticle.perex}
          category={latestArticle.category}
          date={latestArticle.originalDate || latestArticle.publishedAt}
          image={latestArticle.imageUrl || '/placeholder-astronomy.jpg'}
          imageAlt={latestArticle.title}
        />
      </section>

      {/* Discovery Grid Layout */}
      <section className="border-y border-border bg-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Objav dňa</h2>
            <Button variant="ghost" asChild>
              <Link href="/kategoria/objav-dna" className="flex items-center gap-2">
                Všetky objavy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {discoveryArticles.slice(0, 3).map((article) => (
              <ArticleCard 
                key={article.slug} 
                slug={article.slug}
                title={article.title}
                perex={article.perex}
                category={article.category}
                date={article.originalDate || article.publishedAt}
                image={article.imageUrl || '/placeholder-astronomy.jpg'}
                imageAlt={article.title}
                author={article.author}
                source="Infinite AI"
                type="discovery"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-3xl font-bold text-foreground">Najnovšie články</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentArticles.map((article) => (
            <ArticleCard 
              key={article.slug} 
              slug={article.slug}
              title={article.title}
              perex={article.perex}
              category={article.category}
              date={article.originalDate || article.publishedAt}
              image={article.imageUrl || '/placeholder-astronomy.jpg'}
              imageAlt={article.title}
              author={article.author}
              source="Infinite AI"
              type="discovery"
            />
          ))}
        </div>
      </section>

      {/* Community Section */}
      {communityArticles.length > 0 && (
        <section className="border-y border-border bg-card/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">Komunita</h2>
              <Button variant="ghost" asChild>
                <Link href="/kategoria/komunita" className="flex items-center gap-2">
                  Viac z komunity
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {communityArticles.slice(0, 3).map((article) => (
                <ArticleCard 
                  key={article.slug} 
                  slug={article.slug}
                  title={article.title}
                  perex={article.perex}
                  category={article.category}
                  date={new Date(article.originalDate || article.publishedAt).toLocaleDateString('sk-SK')}
                  image={article.imageUrl || '/placeholder-astronomy.jpg'}
                  imageAlt={article.title}
                  author={article.author}
                  source="Infinite AI"
                  type="discovery"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Kids Section */}
      {kidsArticles.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Deti & Vesmír</h2>
            <Button variant="ghost" asChild>
              <Link href="/kategoria/deti-a-vesmir" className="flex items-center gap-2">
                Viac pre deti
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kidsArticles.slice(0, 3).map((article) => (
              <ArticleCard 
                key={article.slug} 
                slug={article.slug}
                title={article.title}
                perex={article.perex}
                category={article.category}
                date={new Date(article.originalDate || article.publishedAt).toLocaleDateString('sk-SK')}
                image={article.imageUrl || '/placeholder-astronomy.jpg'}
                imageAlt={article.title}
                author={article.author}
                source="Infinite AI"
                type="discovery"
              />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="border-y border-border bg-card/50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}
