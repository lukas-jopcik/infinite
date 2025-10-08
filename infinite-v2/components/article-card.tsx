import Link from "next/link"
import Image from "next/image"
import { CategoryBadge } from "./category-badge"
import { Calendar } from "lucide-react"

interface ArticleCardProps {
  slug: string
  title: string
  perex: string
  category: string
  date: string
  image: string
  imageAlt: string
  type: "article" | "discovery"
}

export function ArticleCard({ slug, title, perex, category, date, image, imageAlt, type }: ArticleCardProps) {
  const href = type === "discovery" ? `/objav-dna/${slug}` : `/clanok/${slug}`

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={image || "/placeholder.svg"}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={category} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <time dateTime={date}>{new Date(date).toLocaleDateString("sk-SK")}</time>
          </div>
        </div>
        <h3 className="text-balance text-xl font-bold leading-tight text-card-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="line-clamp-2 text-pretty text-sm leading-relaxed text-muted-foreground">{perex}</p>
      </div>
    </Link>
  )
}
