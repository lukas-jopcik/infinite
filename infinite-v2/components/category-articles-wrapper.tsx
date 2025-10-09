"use client"

import { CategoryArticlesWithPagination } from "./category-articles-with-pagination"
import { Article } from "@/lib/api"

interface CategoryArticlesWrapperProps {
  category: string
  initialArticles: Article[]
  initialLastKey?: string
  initialCount: number
}

export function CategoryArticlesWrapper(props: CategoryArticlesWrapperProps) {
  return <CategoryArticlesWithPagination {...props} />
}
