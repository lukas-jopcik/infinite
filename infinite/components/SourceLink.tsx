"use client"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"

type Props = {
  href: string
  children?: React.ReactNode
  className?: string
}

export default function SourceLink({ href, children = "NASA APOD", className }: Props) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className || "text-blue-400 underline hover:text-blue-300 transition-colors"}
      onClick={() => trackEvent('source_click', { category: 'outbound', label: href })}
    >
      {children}
    </Link>
  )
}


