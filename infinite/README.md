# Infinite - Nekonečné objavy, každý deň

Moderný web pre NASA Astronomy Picture of the Day (APOD) s minimalistickým dark dizajnom.

## Funkcie

- 🌌 Denné zobrazenie NASA APOD s hero sekciou
- 📱 Plne responzívny dizajn (mobile-first)
- 🎨 Minimalistický dark theme
- 🔍 SEO optimalizované s OpenGraph meta tagmi
- 📄 Automaticky generovaný sitemap a RSS feed
- ⚡ Next.js 14 s App Router a ISR (Incremental Static Regeneration)
- 🖼️ Optimalizované obrázky s Next/Image
- 🎥 Podpora pre video obsah (YouTube/Vimeo)

## Technológie

- **Framework:** Next.js 14 (App Router)
- **Jazyk:** TypeScript
- **Styling:** Tailwind CSS
- **Font:** Inter (Google Fonts)
- **API:** NASA APOD API
- **Deploy:** Vercel

## Lokálne spustenie

1. Klonujte repozitár:
\`\`\`bash
git clone <repository-url>
cd infinite-nasa-apod
\`\`\`

2. Nainštalujte závislosti:
\`\`\`bash
npm install
\`\`\`

3. Vytvorte `.env.local` súbor:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Nastavte environment variables v `.env.local`:
\`\`\`
NASA_API_KEY=your_nasa_api_key_here
SITE_URL=http://localhost:3000
\`\`\`

5. Spustite development server:
\`\`\`bash
npm run dev
\`\`\`

6. Otvorte [http://localhost:3000](http://localhost:3000) v prehliadači.

## Environment Variables

- `NASA_API_KEY` - Váš NASA API kľúč (získajte na https://api.nasa.gov/)
- `SITE_URL` - URL vašej stránky (pre SEO a RSS feed)

## Deploy na Vercel

1. Push kód na GitHub
2. Importujte projekt do Vercel
3. Nastavte environment variables v Vercel dashboard
4. Deploy!

## Štruktúra projektu

\`\`\`
/app
  /apod/[date]/page.tsx    # Detail stránky APOD
  /rss.xml/route.ts        # RSS feed
  /globals.css             # Globálne štýly
  /layout.tsx              # Root layout
  /page.tsx                # Homepage
  /sitemap.ts              # Sitemap generátor
  /not-found.tsx           # 404 stránka
/components
  ApodCard.tsx             # Karta pre APOD v listingu
  ApodHero.tsx             # Hero sekcia s najnovším APOD
  Pagination.tsx           # Paginácia
  Prose.tsx                # Typografia pre dlhý text
/lib
  nasa.ts                  # NASA API helper funkcie
  date.ts                  # Date utility funkcie
  seo.ts                   # SEO helper funkcie
/public
  robots.txt               # Robots.txt pre SEO
\`\`\`

## API Endpointy

- `/` - Homepage s hero a listingom
- `/apod/[date]` - Detail stránka pre konkrétny dátum (YYYY-MM-DD)
- `/sitemap.xml` - XML sitemap
- `/rss.xml` - RSS feed

## Licencia

MIT License
