import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
      <div className="max-w-md w-full mx-4">
        <div className="bg-black/60 border border-white/10 rounded-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
            </svg>
            <h1 className="text-2xl font-bold text-white mb-2">Stránka sa nenašla</h1>
            <p className="text-gray-300 mb-6">
              Požadovaná stránka neexistuje alebo bola presunutá. Skús prosím prejsť na hlavnú stránku.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full btn-primary block text-center"
            >
              Späť na hlavnú stránku
            </Link>
            
            <Link
              href="/"
              className="w-full btn-secondary block text-center"
            >
              NASA fotka dňa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}