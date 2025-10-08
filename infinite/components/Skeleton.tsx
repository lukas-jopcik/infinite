import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = false 
}: SkeletonProps) {
  return (
    <div
      className={`bg-gray-800 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function ApodCardSkeleton() {
  return (
    <article className="border border-white/10 rounded-lg overflow-hidden bg-black/20">
      <div className="aspect-video bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <Skeleton height="1.25rem" className="rounded" />
        <Skeleton height="1rem" width="60%" className="rounded" />
        <div className="flex items-center justify-between">
          <Skeleton height="0.875rem" width="40%" className="rounded" />
          <Skeleton height="0.875rem" width="20%" className="rounded" />
        </div>
      </div>
    </article>
  )
}

export function ApodHeroSkeleton() {
  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <div>
              <Skeleton height="1.5rem" width="30%" className="rounded mb-3" />
              <Skeleton height="3rem" className="rounded mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <Skeleton height="1.5rem" width="25%" className="rounded" />
                <Skeleton height="1.5rem" width="20%" className="rounded" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton height="1.5rem" width="15%" className="rounded-full" />
              <Skeleton height="1.5rem" width="20%" className="rounded-full" />
              <Skeleton height="1.5rem" width="18%" className="rounded-full" />
            </div>
            <Skeleton height="1.5rem" className="rounded" />
            <Skeleton height="1.5rem" width="80%" className="rounded" />
            <Skeleton height="3rem" width="40%" className="rounded" />
          </div>
          <div className="order-1 lg:order-2">
            <Skeleton height="400px" className="rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skeleton