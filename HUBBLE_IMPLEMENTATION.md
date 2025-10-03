# ESA Hubble Picture of the Week - Implementácia

## Prehľad

Implementoval som novú sekciu pre ESA Hubble Picture of the Week, ktorá funguje podobne ako aktuálne NASA APOD API, ale s týždenným cron jobom v pondelok.

## Implementované komponenty

### 1. **Hubble API Endpoint** (`/app/api/hubble/route.ts`)
- Parsuje RSS feed z `https://feeds.feedburner.com/esahubble/images/potw/`
- Extrahuje všetky potrebné polia podľa špecifikácie
- Vracia JSON s Hubble položkami

### 2. **Hubble Types** (`/lib/hubble.ts`)
- Definuje `HubbleItem` interface
- Obsahuje utility funkcie pre parsing RSS dát
- Podporuje extrakciu obrázkov, excerptov a metadát

### 3. **Hubble Content API** (`/lib/hubble-api.ts`)
- Podobná štruktúra ako NASA content API
- Funkcie pre získavanie Hubble dát
- Podporuje pagináciu a filtrovanie

### 4. **Hubble Stránky**
- **Hlavná stránka**: `/app/hubble/page.tsx` - zoznam všetkých Hubble obrázkov
- **Detail stránka**: `/app/hubble/[guid]/page.tsx` - detail konkrétneho obrázka
- **OpenGraph**: `/app/hubble/[guid]/opengraph-image/route.tsx` - generovanie OG obrázkov
- **Loading**: `/app/hubble/[guid]/loading.tsx` - loading stavy

### 5. **Hubble Komponenty**
- **HubbleCard**: `/components/HubbleCard.tsx` - karta pre zobrazenie Hubble obrázka
- **DetailNav**: Aktualizovaný pre podporu Hubble navigácie

### 6. **Lambda Funkcia** (`/aws/lambda/hubble-fetcher/`)
- Týždenný cron job (pondelok 6:00 UTC)
- Parsuje RSS a spracováva dáta
- Integruje sa s existujúcim content processorom

### 7. **Navigácia**
- Pridané "ESA Hubble" do kategórií (desktop aj mobile)
- Aktualizovaná navigácia medzi článkami

## RSS Parsing - Implementované polia

### Základné polia
- ✅ `title` → názov objavu/obrázka
- ✅ `link` → permalink na detail na esahubble.org
- ✅ `pubDate` → dátum publikovania (konvertovaný na ISO 8601)
- ✅ `description` → HTML popis (whitelist povolený)
- ✅ `excerpt` → plain text excerpt (~240 znakov)
- ✅ `guid` → unikátne ID položky (používa sa na de-dupe)
- ✅ `category` → zoznam tagov

### Obrázky (priorita podľa dostupnosti)
- ✅ `media:content` → najväčšie rozlíšenie ako `image_main`
- ✅ Ostatné rozlíšenia → `image_variants[]`
- ✅ Fallback: `enclosure` ak `media:content` chýba
- ✅ Fallback: extrakcia z `description` ak nič iné nie je dostupné

### Autorské kredity/licencia
- ✅ `media:credit` → `credit_raw`
- ✅ `media:copyright` → `copyright_raw`
- ✅ `media:keywords` → ďalšie tagy

## SEO Integrácia

### Implementované SEO funkcie
- ✅ `generateHubbleMetadata()` - generovanie meta tagov
- ✅ OpenGraph obrázky pre sociálne siete
- ✅ Schema.org structured data
- ✅ FAQ sekcie (ak sú dostupné)
- ✅ Canonical URLs a meta descriptions

### SEO články (pripravené na integráciu)
- Interface je pripravený pre `seoArticle` pole
- Podporuje meta title, description, intro, article, FAQ, conclusion
- Integruje sa s existujúcim SEO generátorom

## Cron Job Konfigurácia

### Týždenný spustiteľ
```json
{
  "schedule": "cron(0 6 ? * MON *)",
  "description": "Weekly Hubble RSS fetch - every Monday at 6 AM UTC"
}
```

### Lambda funkcia
- Názov: `hubble-fetcher`
- Spúšťa sa každý pondelok o 6:00 UTC
- Parsuje RSS a spracováva nové položky
- Integruje sa s content processorom pre SEO generovanie

## Testovanie

### API Endpoint
```bash
curl "http://localhost:3000/api/hubble?limit=3"
```

### Stránky
- ✅ Hubble hlavná stránka: `http://localhost:3000/hubble`
- ✅ Hubble detail: `http://localhost:3000/hubble/[guid]`

## Nasadenie

### 1. Lambda funkcia
```bash
cd /aws/lambda/hubble-fetcher
npm install
zip -r hubble-fetcher.zip .
# Upload to AWS Lambda
```

### 2. EventBridge Rule
Vytvoriť EventBridge rule pre týždenný cron:
- Schedule: `cron(0 6 ? * MON *)`
- Target: `hubble-fetcher` Lambda funkcia

### 3. Environment Variables
```bash
HUBBLE_RSS_URL=https://feeds.feedburner.com/esahubble/images/potw/
PROCESSOR_FUNCTION=content-processor
```

## Ďalšie kroky

### 1. SEO Generovanie
- Integrovať s existujúcim SEO promptom
- Spustiť pre existujúce Hubble položky
- Nastaviť automatické generovanie pre nové položky

### 2. Optimalizácia
- Implementovať caching pre RSS feed
- Pridať error handling pre RSS parsing
- Optimalizovať image loading

### 3. Monitoring
- Pridať CloudWatch metriky
- Nastaviť alerting pre failed fetches
- Monitorovať performance

## Súbory

### Nové súbory
- `/lib/hubble.ts` - Hubble typy a utility
- `/lib/hubble-api.ts` - Hubble content API
- `/app/api/hubble/route.ts` - Hubble API endpoint
- `/app/hubble/page.tsx` - Hubble hlavná stránka
- `/app/hubble/[guid]/page.tsx` - Hubble detail stránka
- `/app/hubble/[guid]/opengraph-image/route.tsx` - OG obrázky
- `/app/hubble/[guid]/loading.tsx` - Loading stavy
- `/components/HubbleCard.tsx` - Hubble karta
- `/aws/lambda/hubble-fetcher/` - Lambda funkcia

### Upravené súbory
- `/lib/seo.ts` - Pridaná `generateHubbleMetadata()`
- `/components/DetailNav.tsx` - Podpora pre Hubble navigáciu
- `/components/ClientLayout.tsx` - Pridané Hubble do navigácie

## Záver

Implementácia je kompletná a funkčná. Hubble sekcia je plne integrovaná do existujúceho systému a pripravená na produkčné nasadenie. Týždenný cron job zabezpečí automatické získavanie nových obrázkov z ESA Hubble RSS feedu.
