import Link from 'next/link'
import { OptimizedImage } from './OptimizedImage'
import { formatDate } from '@/lib/date'
import type { HubbleItem } from '@/lib/hubble'

interface HubbleCardProps {
  hubble: HubbleItem
  priority?: boolean
}

export function HubbleCard({ hubble, priority = false }: HubbleCardProps) {
  const date = new Date(hubble.pubDate)
  const formattedDate = formatDate(hubble.pubDate.split('T')[0])
  
  // Extract reading time estimate (rough calculation)
  const readingTime = Math.max(3, Math.ceil((hubble.excerpt.length + hubble.title.length) / 200))

  return (
    <article className="h-full">
      <Link 
        href={`/objav-tyzdna/${hubble.guid}`} 
        className="hubble-card block focus-visible h-full flex flex-col"
        aria-label={`Prečítať článok: ${hubble.title} z ${formattedDate}`}
      >
        <div className="aspect-video relative mb-4 overflow-hidden">
          <OptimizedImage
            src={hubble.image_main || ''}
            alt={hubble.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            priority={priority}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        <div className="p-4 flex-1 flex flex-col min-h-[120px]">
          <h3 className="font-semibold mb-2 text-balance line-clamp-2 leading-tight flex-1 min-h-[2.5rem]">
            {hubble.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mt-auto">
            <time dateTime={hubble.pubDate.split('T')[0]}>
              {formattedDate}
            </time>
            <span aria-label={`Čas čítania: ${readingTime} minút`}>
              {readingTime} min
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
