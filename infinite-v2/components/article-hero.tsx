import Link from "next/link"
import Image from "next/image"
import { CategoryBadge } from "./category-badge"
import { Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArticleHeroProps {
  slug: string
  title: string
  perex: string
  category: string
  date: string
  image: string
  imageAlt: string
}

export function ArticleHero({ slug, title, perex, category, date, image, imageAlt }: ArticleHeroProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-card">
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[16/9] lg:aspect-auto">
          <Image src={image || "/placeholder.svg"} alt={imageAlt} fill priority className="object-cover" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
          <div className="flex items-center gap-3">
            <CategoryBadge category={category} />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={date}>{new Date(date).toLocaleDateString("sk-SK")}</time>
            </div>
          </div>

          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground lg:text-5xl">{title}</h1>

          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{perex}</p>

          <div>
            <Button size="lg" asChild>
              <Link href={`/clanok/${slug}`} className="flex items-center gap-2">
                Čítať článok
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
