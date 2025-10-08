import { Skeleton } from "@/components/Skeleton"

export default function ApodDetailLoading() {
  return (
    <article className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb skeleton */}
        <div className="mb-8">
          <Skeleton height="1.5rem" width="200px" className="rounded" />
        </div>

        {/* Header skeleton */}
        <header className="mb-8">
          <Skeleton height="3rem" className="rounded mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <Skeleton height="1.5rem" width="150px" className="rounded" />
            <Skeleton height="1.5rem" width="100px" className="rounded" />
          </div>
        </header>

        {/* Image skeleton */}
        <div className="mb-8">
          <Skeleton height="400px" className="rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton height="1.25rem" className="rounded" />
          <Skeleton height="1.25rem" className="rounded" />
          <Skeleton height="1.25rem" width="80%" className="rounded" />
          <Skeleton height="1.25rem" className="rounded" />
          <Skeleton height="1.25rem" width="90%" className="rounded" />
          <Skeleton height="1.25rem" className="rounded" />
          <Skeleton height="1.25rem" width="75%" className="rounded" />
        </div>

        {/* Footer skeleton */}
        <footer className="border-t border-[#1f1f1f] pt-6">
          <Skeleton height="1rem" width="200px" className="rounded" />
        </footer>

        {/* Related articles skeleton */}
        <section className="mt-12">
          <Skeleton height="2rem" width="250px" className="rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-white/10 rounded-lg overflow-hidden bg-black/20">
                <Skeleton height="200px" />
                <div className="p-4 space-y-3">
                  <Skeleton height="1.25rem" className="rounded" />
                  <Skeleton height="1rem" width="60%" className="rounded" />
                  <div className="flex items-center justify-between">
                    <Skeleton height="0.875rem" width="40%" className="rounded" />
                    <Skeleton height="0.875rem" width="20%" className="rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation skeleton */}
        <nav className="mt-12">
          <div className="flex justify-between items-center">
            <Skeleton height="3rem" width="120px" className="rounded" />
            <Skeleton height="3rem" width="120px" className="rounded" />
          </div>
        </nav>
      </div>
    </article>
  )
}