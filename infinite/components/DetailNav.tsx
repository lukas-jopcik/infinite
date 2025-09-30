"use client"
import Link from "next/link"
import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

type Props = {
  newerHref?: string
  olderHref?: string
}

export function DetailNav({ newerHref, olderHref }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && olderHref) {
        trackEvent('nav_prev_keyboard', { category: 'navigation', label: olderHref })
        window.location.href = olderHref
      } else if (e.key === "ArrowRight" && newerHref) {
        trackEvent('nav_next_keyboard', { category: 'navigation', label: newerHref })
        window.location.href = newerHref
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [newerHref, olderHref])

  return (
    <div className="flex justify-between items-center mt-8">
      <div>
        {olderHref ? (
          <Link className="btn-secondary" href={olderHref} aria-label="Starší článok (šípka doľava)" onClick={() => trackEvent('nav_prev_click', { category: 'navigation', label: olderHref })}>
            ← Starší
          </Link>
        ) : <span />}
      </div>
      <div>
        {newerHref ? (
          <Link className="btn-secondary" href={newerHref} aria-label="Novší článok (šípka doprava)" onClick={() => trackEvent('nav_next_click', { category: 'navigation', label: newerHref })}>
            Novší →
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}

export default DetailNav


