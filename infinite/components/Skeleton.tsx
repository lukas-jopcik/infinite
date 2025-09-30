type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-800/40 ${className}`} />
  )
}

export default Skeleton


