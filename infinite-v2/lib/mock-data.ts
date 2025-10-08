export interface Article {
  slug: string
  title: string
  perex: string
  content: string
  category: string
  date: string
  image: string
  imageAlt: string
  author: string
  source?: string
  type: "article" | "discovery"
}

export const mockArticles: Article[] = [
  {
    slug: "supernova-v-galaxii-m87",
    title: "Supernova v galaxii M87 ohromila astronómov svojou intenzitou",
    perex: "Vedci zaznamenali jednu z najjasnejších supernov v histórii pozorovania, ktorá osvetlila celú galaxiu M87.",
    content: "Kompletný obsah článku...",
    category: "objav-dna",
    date: "2025-01-07",
    image: "/supernova-explosion-galaxy.jpg",
    imageAlt: "Supernova v galaxii M87",
    author: "Infinite",
    source: "ESO Observatory",
    type: "discovery",
  },
  {
    slug: "ako-vznikaju-cierne-diery",
    title: "Ako vznikajú čierne diery? Kompletný sprievodca",
    perex:
      "Objavte fascinujúci proces vzniku čiernych dier od kolapsu hviezd až po supermasívne čierne diery v centrách galaxií.",
    content: "Kompletný obsah článku...",
    category: "vysvetlenia",
    date: "2025-01-06",
    image: "/black-hole-formation.jpg",
    imageAlt: "Vznik čiernej diery",
    author: "Infinite",
    type: "article",
  },
  {
    slug: "reddit-najlepsie-astrofotografie",
    title: "Reddit komunita zdieľa najlepšie astrofotografie mesiaca",
    perex: "Pozrite si úchvatné snímky vesmíru, ktoré vytvorili amatérski astronómovia z celého sveta.",
    content: "Kompletný obsah článku...",
    category: "komunita",
    date: "2025-01-05",
    image: "/astrophotography-milky-way.jpg",
    imageAlt: "Astrofotografia Mliečnej dráhy",
    author: "Infinite",
    source: "Reddit r/astrophotography",
    type: "article",
  },
  {
    slug: "planety-pre-deti",
    title: "Spoznaj planéty slnečnej sústavy – pre deti",
    perex:
      "Zábavný a vzdelávací sprievodca planétami pre mladých astronómov. Objavte tajomstvá Merkúra, Venuše, Zeme a ďalších.",
    content: "Kompletný obsah článku...",
    category: "deti-a-vesmir",
    date: "2025-01-04",
    image: "/solar-system-planets-colorful.jpg",
    imageAlt: "Planéty slnečnej sústavy",
    author: "Infinite",
    type: "article",
  },
  {
    slug: "james-webb-novy-obraz",
    title: "James Webb zachytil najdetailnejší obraz vzdialených galaxií",
    perex: "Nové snímky z teleskopu James Webb odhaľujú galaxie staré viac ako 13 miliárd rokov.",
    content: "Kompletný obsah článku...",
    category: "objav-dna",
    date: "2025-01-03",
    image: "/james-webb-deep-field-galaxies.jpg",
    imageAlt: "James Webb Deep Field",
    author: "Infinite",
    source: "NASA/ESA",
    type: "discovery",
  },
  {
    slug: "mars-voda-objavena",
    title: "Na Marse objavená tekutá voda pod povrchom",
    perex:
      "Rover Perseverance našiel dôkazy o tekutej vode v podzemných vrstvách Marsu, čo môže zmeniť naše chápanie červenej planéty.",
    content: "Kompletný obsah článku...",
    category: "objav-dna",
    date: "2025-01-02",
    image: "/mars-water-discovery.jpg",
    imageAlt: "Objavená voda na Marse",
    author: "Infinite",
    type: "discovery",
  },
  {
    slug: "co-su-exoplanety",
    title: "Čo sú exoplanéty a prečo sú dôležité?",
    perex: "Spoznajte planéty mimo našej slnečnej sústavy a ich význam pre hľadanie mimozemského života.",
    content: "Kompletný obsah článku...",
    category: "vysvetlenia",
    date: "2025-01-01",
    image: "/exoplanets.jpg",
    imageAlt: "Exoplanéty",
    author: "Infinite",
    type: "article",
  },
  {
    slug: "astrofotografia-pre-zaciatocnikov",
    title: "Astrofotografia pre začiatočníkov – kompletný sprievodca",
    perex: "Naučte sa fotografovať hviezdy, planéty a galaxie s týmto podrobným návodom.",
    content: "Kompletný obsah článku...",
    category: "komunita",
    date: "2024-12-30",
    image: "/astrophotography-equipment.jpg",
    imageAlt: "Astrofotografia vybavenie",
    author: "Infinite",
    type: "article",
  },
]

export function getArticlesByCategory(category: string): Article[] {
  return mockArticles.filter((article) => article.category === category)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return mockArticles.find((article) => article.slug === slug)
}

export function getLatestArticles(limit = 6): Article[] {
  return mockArticles.slice(0, limit)
}
