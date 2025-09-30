import { Skeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <div>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Hero skeleton */}
          <div className="mb-12">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
            <Skeleton className="h-8 w-3/4 mt-6" />
            <Skeleton className="h-4 w-1/3 mt-3" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="apod-card">
                <div className="aspect-video relative">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-5 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


