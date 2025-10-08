"use client"
import Link from "next/link"
import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

type Props = {
  newerHref?: string
  olderHref?: string
  // New interface for objects with date/guid
  newer?: { date?: string; guid?: string }
  older?: { date?: string; guid?: string }
  basePath?: string
}

export function DetailNav({ newerHref, olderHref, newer, older, basePath }: Props) {
  // Generate hrefs from objects if provided
  const finalNewerHref = newerHref || (newer && basePath ? 
    (newer.date ? `${basePath}/${newer.date}` : `${basePath}/${newer.guid}`) : undefined)
  const finalOlderHref = olderHref || (older && basePath ? 
    (older.date ? `${basePath}/${older.date}` : `${basePath}/${older.guid}`) : undefined)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && finalOlderHref) {
        trackEvent('nav_prev_keyboard', { category: 'navigation', label: finalOlderHref })
        window.location.href = finalOlderHref
      } else if (e.key === "ArrowRight" && finalNewerHref) {
        trackEvent('nav_next_keyboard', { category: 'navigation', label: finalNewerHref })
        window.location.href = finalNewerHref
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [finalNewerHref, finalOlderHref])

  return (
    <div className="flex justify-between items-center mt-8">
      <div>
        {finalOlderHref ? (
          <Link className="btn-secondary" href={finalOlderHref} aria-label="Starší článok (šípka doľava)" onClick={() => trackEvent('nav_prev_click', { category: 'navigation', label: finalOlderHref })}>
            ← Starší
          </Link>
        ) : <span />}
      </div>
      <div>
        {finalNewerHref ? (
          <Link className="btn-secondary" href={finalNewerHref} aria-label="Novší článok (šípka doprava)" onClick={() => trackEvent('nav_next_click', { category: 'navigation', label: finalNewerHref })}>
            Novší →
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}

export default DetailNav


