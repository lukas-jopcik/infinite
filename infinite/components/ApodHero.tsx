"use client"
import Image from "next/image"
import Link from "next/link"
import type { Apod } from "@/lib/nasa"
import { formatDate } from "@/lib/date"
import { enhanceApodContent, getReadingTime, getTags } from "@/lib/mock-content"
import { trackEvent } from "@/lib/analytics"
import React from "react"

interface ApodHeroProps {
  apod: Apod
}

export function ApodHero({ apod }: ApodHeroProps) {
  const enhancedExplanation = enhanceApodContent(apod.title, apod.explanation)
  // Prefer API article text when available; lightly sanitize markdown headers like ###
  const rawIntro = (apod.explanation || enhancedExplanation || "").toString()
  const sanitizedIntro = rawIntro
    .replace(/^#+\s+/gm, "")
    .replace(/`/g, "")
    .trim()
  const shortDescription = sanitizedIntro.length > 160 ? sanitizedIntro.slice(0, 160) + "..." : sanitizedIntro
  const readingTime = getReadingTime(apod.title, apod.explanation)
  const tags = getTags(apod.title, apod.explanation)

  return (
    <section className="py-12 lg:py-20" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <div>
              <span className="inline-block bg-black/40 border border-white/5 text-white/90 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-md mb-3 backdrop-blur-sm">
                Dnes objavujeme
              </span>
              <h1 id="hero-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance leading-tight">
                {apod.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <time dateTime={apod.date} className="inline-flex items-center bg-black/30 border border-white/5 text-gray-200/90 text-xs px-3 py-1 rounded-md backdrop-blur-sm">
                  {formatDate(apod.date)}
                </time>
                <span className="inline-flex items-center bg-black/30 border border-white/5 text-gray-200/90 text-xs px-3 py-1 rounded-md backdrop-blur-sm" aria-label={`Čas čítania: ${readingTime} minút`}>
                  {readingTime} min čítania
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Témy článku">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700"
                  role="listitem"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-lg lg:text-xl leading-relaxed text-pretty text-gray-300">{shortDescription}</p>

            <Link
              href={`/apod/${apod.date}`}
              className="btn-primary inline-flex items-center px-8 py-4 text-lg focus-visible"
              onClick={() => trackEvent('cta_read_more', { category: 'cta', label: apod.date })}
              aria-label={`Prečítať celý článok: ${apod.title}`}
            >
              Čítať ďalej
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            {apod.media_type === "image" ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-black/50">
                <Image
                  src={apod.hdurl || apod.url}
                  alt={apod.title}
                  fill
                  className="object-cover"
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden="true" />
              </div>
            ) : (
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <iframe
                  src={apod.url.replace("watch?v=", "embed/")}
                  title={apod.title}
                  className="w-full h-full"
                  allowFullScreen
                  aria-label={`Video: ${apod.title}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
