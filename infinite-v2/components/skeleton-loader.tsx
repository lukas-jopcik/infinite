import { Skeleton } from "@/components/ui/skeleton"

// Enhanced Skeleton with shimmer effect
function ShimmerSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <div className="relative overflow-hidden">
      <Skeleton className={`${className} animate-pulse`} {...props} />
      <div 
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" 
      />
    </div>
  )
}

export function HomepageSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Hero Section Skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="group relative overflow-hidden rounded-3xl bg-card">
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Image Skeleton */}
            <div className="relative aspect-[16/9] lg:aspect-auto">
              <ShimmerSkeleton className="h-full w-full" />
            </div>
            
            {/* Content Skeleton */}
            <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
              <div className="flex items-center gap-3">
                <ShimmerSkeleton className="h-6 w-20" />
                <ShimmerSkeleton className="h-4 w-24" />
              </div>
              <ShimmerSkeleton className="h-12 w-full" />
              <ShimmerSkeleton className="h-6 w-3/4" />
              <ShimmerSkeleton className="h-6 w-1/2" />
              <ShimmerSkeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Section Skeleton */}
      <section className="border-y border-border bg-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <ShimmerSkeleton className="h-8 w-32" />
            <ShimmerSkeleton className="h-8 w-24" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <ShimmerSkeleton className="aspect-[16/9] w-full" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <ShimmerSkeleton className="h-5 w-16" />
                    <ShimmerSkeleton className="h-4 w-20" />
                  </div>
                  <ShimmerSkeleton className="h-6 w-full" />
                  <ShimmerSkeleton className="h-4 w-3/4" />
                  <ShimmerSkeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles Skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ShimmerSkeleton className="mb-8 h-8 w-48" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <ShimmerSkeleton className="aspect-[16/9] w-full" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <ShimmerSkeleton className="h-5 w-16" />
                  <ShimmerSkeleton className="h-4 w-20" />
                </div>
                <ShimmerSkeleton className="h-6 w-full" />
                <ShimmerSkeleton className="h-4 w-3/4" />
                <ShimmerSkeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Skeleton */}
      <section className="border-y border-border bg-card/50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShimmerSkeleton className="mx-auto mb-2 h-8 w-64" />
            <ShimmerSkeleton className="mx-auto mb-6 h-4 w-96" />
            <ShimmerSkeleton className="mx-auto h-12 w-48" />
          </div>
        </div>
      </section>
    </div>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <ShimmerSkeleton className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <ShimmerSkeleton className="h-5 w-16" />
          <ShimmerSkeleton className="h-4 w-20" />
        </div>
        <ShimmerSkeleton className="h-6 w-full" />
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
