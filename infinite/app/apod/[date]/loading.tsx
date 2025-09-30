import { Skeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <article className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />

        <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </article>
  )
}


