"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Pagination } from "@/components/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { ArticlesAPI, Article } from "@/lib/api"

const ARTICLES_PER_PAGE = 12

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Article[]>([])
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Load all articles on component mount
  useEffect(() => {
    const loadAllArticles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch articles from all categories
        const [objavDnaResponse, vysvetleniaResponse, komunitaResponse, detiResponse] = await Promise.all([
          ArticlesAPI.getArticlesByCategory("objav-dna", 100).catch(() => ({ articles: [], count: 0 })),
          ArticlesAPI.getArticlesByCategory("vysvetlenia", 100).catch(() => ({ articles: [], count: 0 })),
          ArticlesAPI.getArticlesByCategory("komunita", 100).catch(() => ({ articles: [], count: 0 })),
          ArticlesAPI.getArticlesByCategory("deti-a-vesmir", 100).catch(() => ({ articles: [], count: 0 }))
        ])

        // Combine all articles
        const combinedArticles = [
          ...objavDnaResponse.articles,
          ...vysvetleniaResponse.articles,
          ...komunitaResponse.articles,
          ...detiResponse.articles
        ]

        // Sort by date (newest first)
        combinedArticles.sort((a, b) => {
          const dateA = new Date(a.originalDate || a.publishedAt)
          const dateB = new Date(b.originalDate || b.publishedAt)
          return dateB.getTime() - dateA.getTime()
        })

        setAllArticles(combinedArticles)
        setResults(combinedArticles)
        setTotalCount(combinedArticles.length)
      } catch (err) {
        setError('Nepodarilo sa načítať články')
        console.error('Error loading articles:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllArticles()
  }, [])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setCurrentPage(1) // Reset to first page when searching
    
    if (searchQuery.trim() === "") {
      setResults(allArticles)
      setTotalCount(allArticles.length)
    } else {
      const filtered = allArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.perex.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered)
      setTotalCount(filtered.length)
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const endIndex = startIndex + ARTICLES_PER_PAGE
  const paginatedResults = results.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Domov", href: "/" }, { label: "Vyhľadávanie" }]} />
        </div>
      </div>

      {/* Search Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/50 to-transparent py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-foreground lg:text-5xl">Vyhľadávanie</h1>
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hľadaj články, objavy, témy..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            {query ? (
              <>
                Nájdených <span className="font-semibold text-foreground">{totalCount}</span> výsledkov pre &quot;
                <span className="font-semibold text-foreground">{query}</span>&quot;
              </>
            ) : (
              <>
                Zobrazených <span className="font-semibold text-foreground">{totalCount}</span> článkov
              </>
            )}
            {totalPages > 1 && ` • Strana ${currentPage} z ${totalPages}`}
          </p>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: ARTICLES_PER_PAGE }).map((_, index) => (
              <div key={index} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-lg text-destructive">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Skúsiť znovu
            </button>
          </div>
        ) : paginatedResults.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedResults.map((article) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl="/hladat"
                  hasNextPage={currentPage < totalPages}
                  hasPreviousPage={currentPage > 1}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">Žiadne výsledky</h3>
            <p className="text-muted-foreground">
              {query ? "Skús iný výraz alebo prechádzaj kategórie." : "Žiadne články na zobrazenie."}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
