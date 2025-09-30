import Link from "next/link"

export default function NotFound() {
  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="bg-black/60 border border-white/10 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Stránka sa nenašla</h1>
          <p className="text-gray-300 mb-6">Obsah, ktorý hľadáš, neexistuje alebo bol presunutý.</p>
          <Link href="/" className="btn-primary">Späť na hlavnú stránku</Link>
        </div>
      </div>
    </section>
  )
}
