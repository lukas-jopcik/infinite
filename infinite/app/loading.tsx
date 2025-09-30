import { ApodHeroSkeleton, ApodCardSkeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <div className="relative">
      {/* Background placeholder */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
      
      {/* Hero skeleton */}
      <ApodHeroSkeleton />
      
      {/* Articles skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-2xl font-bold mb-8 text-center">
            <div className="h-8 bg-gray-800 animate-pulse rounded w-64 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ApodCardSkeleton key={i} />
            ))}
          </div>
          
          {/* Pagination skeleton */}
          <div className="flex justify-center items-center gap-4 py-12">
            <div className="h-12 bg-gray-800 animate-pulse rounded w-24" />
            <div className="h-8 bg-gray-800 animate-pulse rounded w-16" />
            <div className="h-12 bg-gray-800 animate-pulse rounded w-24" />
          </div>
        </div>
      </section>
    </div>
  )
}