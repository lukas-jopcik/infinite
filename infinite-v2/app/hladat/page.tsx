"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ArticleCard } from "@/components/article-card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { mockArticles } from "@/lib/mock-data"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(mockArticles)

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim() === "") {
      setResults(mockArticles)
    } else {
      const filtered = mockArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.perex.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setResults(filtered)
    }
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
                Nájdených <span className="font-semibold text-foreground">{results.length}</span> výsledkov pre "
                <span className="font-semibold text-foreground">{query}</span>"
              </>
            ) : (
              <>
                Zobrazených <span className="font-semibold text-foreground">{results.length}</span> článkov
              </>
            )}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">Žiadne výsledky</h3>
            <p className="text-muted-foreground">Skús iný výraz alebo prechádzaj kategórie.</p>
          </div>
        )}
      </section>
    </div>
  )
}
