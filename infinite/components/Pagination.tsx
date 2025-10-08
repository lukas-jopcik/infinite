import Link from "next/link"

interface PaginationProps {
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function Pagination({ currentPage, hasNextPage, hasPrevPage }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-4 py-12">
      {hasPrevPage && (
        <Link
          href={currentPage === 2 ? "/" : `/?page=${currentPage - 1}`}
          className="btn-secondary px-6 py-3 flex items-center gap-2 focus-visible"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Novšie
        </Link>
      )}

      <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
        <span className="text-sm">Stránka</span>
        <span className="font-semibold text-white">{currentPage}</span>
      </div>

      {hasNextPage && (
        <Link
          href={`/?page=${currentPage + 1}`}
          className="btn-secondary px-6 py-3 flex items-center gap-2 focus-visible"
        >
          Staršie
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}
