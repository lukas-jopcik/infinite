"use client"
import Link from "next/link"
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="bg-black/60 border border-white/10 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Vyskytla sa chyba</h1>
          <p className="text-gray-300 mb-4">Skús obnoviť stránku alebo sa vráť na hlavnú.</p>
          <div className="flex gap-3 justify-center">
            <button className="btn-secondary" onClick={() => reset()}>Obnoviť</button>
            <Link href="/" className="btn-primary">Domov</Link>
          </div>
          {process.env.NODE_ENV !== 'production' && error?.digest && (
            <p className="text-xs text-gray-500 mt-4">Kód chyby: {error.digest}</p>
          )}
        </div>
      </div>
    </section>
  )
}


