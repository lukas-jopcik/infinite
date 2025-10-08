'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-black/60 border border-white/10 rounded-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-2">Niečo sa pokazilo</h1>
            <p className="text-gray-300 mb-6">
              Ospravedlňujeme sa za nepríjemnosti. Skús prosím obnoviť stránku alebo sa vráť na hlavnú stránku.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full btn-primary"
            >
              Skúsiť znovu
            </button>
            
            <Link
              href="/"
              className="w-full btn-secondary block text-center"
            >
              Späť na hlavnú stránku
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-gray-400 cursor-pointer">
                Technické detaily (len pre vývojárov)
              </summary>
              <pre className="mt-2 text-xs text-gray-500 bg-gray-900/50 p-3 rounded overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}