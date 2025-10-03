export default function HubbleDetailLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Breadcrumb skeleton */}
        <div className="mb-8">
          <div className="h-6 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Header skeleton */}
        <header className="mb-8">
          <div className="h-12 w-full bg-gray-800 rounded animate-pulse mb-4"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </header>

        {/* Image skeleton */}
        <div className="mb-8">
          <div className="aspect-video bg-gray-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Content skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Source link skeleton */}
        <div className="mb-8">
          <div className="h-10 w-40 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Navigation skeleton */}
        <div className="flex justify-between items-center py-8">
          <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
