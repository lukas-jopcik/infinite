"use client"
import Link from "next/link"
import type { Apod } from "@/lib/nasa"
import { formatDate } from "@/lib/date"
import { getReadingTime } from "@/lib/mock-content"
import { trackEvent } from "@/lib/analytics"
import { OptimizedImage } from "@/components/OptimizedImage"
import { isMobileDevice } from "@/lib/mobile-optimization"

interface ApodCardProps {
  apod: Apod
  priority?: boolean
}

export function ApodCard({ apod, priority = false }: ApodCardProps) {
  const readingTime = getReadingTime(apod.title, apod.explanation)

  return (
    <article className="h-full">
      <Link 
        href={`/apod/${apod.date}`} 
        className="apod-card block focus-visible h-full flex flex-col" 
        onClick={() => trackEvent('card_open_detail', { category: 'navigation', label: apod.date })}
        aria-label={`Prečítať článok: ${apod.title} z ${formatDate(apod.date)}`}
        prefetch={priority}
      >
        <div className="aspect-video relative mb-4 overflow-hidden">
          {apod.media_type === "image" ? (
            <OptimizedImage
              src={apod.url || "/placeholder.svg"}
              alt={apod.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={priority ? (isMobileDevice() ? 60 : 80) : (isMobileDevice() ? 45 : 65)}
              hdSrc={apod.hdurl} // Pass HD source but mobile will ignore it
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs text-gray-500">Video</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col min-h-[120px]">
          <h3 className="font-semibold mb-2 text-balance line-clamp-2 leading-tight flex-1 min-h-[2.5rem]">{apod.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mt-auto">
            <time dateTime={apod.date}>{formatDate(apod.date)}</time>
            <span aria-label={`Čas čítania: ${readingTime} minút`}>{readingTime} min</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
