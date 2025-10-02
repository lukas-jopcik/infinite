# Infinite - NASA Fotka dňa v slovenčine

Moderná webová aplikácia pre zobrazovanie NASA Astronomy Picture of the Day (APOD) v slovenčine s AI-generovaným obsahom a optimalizovaným výkonom.

## 🚀 Funkcie

- **AI-generovaný slovenský obsah** - Rozšírené články (700-900 slov) z NASA opisov pomocou OpenAI GPT-4
- **Automatické denné aktualizácie** - Automatický fetch z NASA API každý deň
- **Optimalizovaný výkon** - Rýchle načítanie stránok s lazy loading, ISR a CDN
- **SEO optimalizácia s AI** - AI-generované slovenské kľúčové slová a meta tagy
- **Image caching** - S3 + CloudFront CDN pre optimálny výkon
- **Quality validation** - Automatická kontrola gramatiky a vedeckej presnosti
- **Responsive dizajn** - Funguje na všetkých zariadeniach
- **Accessibility** - Podporuje screen readery a klávesnicovú navigáciu
- **RSS feed** - Automaticky generovaný RSS feed
- **Sitemap** - Automaticky generovaný sitemap.xml

## 🛠️ Technológie

### Frontend
- **Next.js 14** - React framework s App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **WebGL** - Pre Aurora pozadie efekt
- **Playwright** - E2E testovanie

### Backend (AWS)
- **AWS Lambda** - Serverless compute (Node.js 18.x)
- **DynamoDB** - NoSQL databáza pre content
- **S3 + CloudFront** - Image caching a CDN
- **API Gateway** - REST API endpoints
- **EventBridge** - Scheduled daily fetches
- **OpenAI GPT-4o-mini** - AI content generation
- **CloudWatch** - Monitoring a logging

## 📦 Inštalácia

```bash
# Klonovanie repozitára
git clone <repository-url>
cd infinite

# Inštalácia závislostí
npm install

# Nastavenie environment premenných
cp .env.example .env.local
# Upravte .env.local podľa potreby

# Spustenie development servera
npm run dev
```

## 🔧 Skripty

```bash
# Development
npm run dev          # Spustí development server
npm run build        # Vytvorí production build
npm run start        # Spustí production server

# Linting a TypeScript
npm run lint         # Spustí ESLint
npm run lint:fix     # Opraví ESLint chyby
npm run type-check   # Kontrola TypeScript typov

# Testovanie
npm run test:e2e     # Spustí E2E testy
npm run test:e2e:ui  # Spustí E2E testy s UI
npm run test:e2e:headed # Spustí E2E testy s browserom

# Analýza
npm run analyze      # Analýza bundle veľkosti
```

## ⚡ Optimalizácie výkonu

### Obrázky
- **Next.js Image komponent** - Automatická optimalizácia
- **WebP/AVIF formáty** - Moderné formáty obrázkov
- **Lazy loading** - Načítanie obrázkov len keď sú potrebné
- **Blur placeholder** - Placeholder počas načítavania

### CSS
- **Tailwind CSS** - Utility-first prístup
- **CSS-in-JS optimalizácia** - Automatická optimalizácia
- **Critical CSS** - Inline kritické štýly

### JavaScript
- **Code splitting** - Automatické rozdelenie kódu
- **Tree shaking** - Odstránenie nepoužívaného kódu
- **Bundle analýza** - Monitoring veľkosti bundle

### API
- **Caching** - Redis cache pre API volania
- **Error handling** - Graceful error handling
- **Retry logic** - Automatické opakovanie neúspešných volaní

## 🎨 Komponenty

### Hlavné komponenty
- `ApodHero` - Hlavný banner s najnovším APOD
- `ApodCard` - Karta pre zobrazenie APOD
- `Aurora` - WebGL pozadie efekt
- `Analytics` - Google Analytics integrácia
- `ConsentBanner` - GDPR súhlas banner

### Utility komponenty
- `Skeleton` - Loading skeleton komponenty
- `Pagination` - Stránkovanie
- `DetailNav` - Navigácia medzi článkami

## 📱 Responsive dizajn

- **Mobile First** - Dizajn začínajúci od mobilných zariadení
- **Breakpoints** - 768px (tablet), 1024px (desktop)
- **Touch friendly** - Optimalizované pre dotykové zariadenia

## ♿ Accessibility

- **ARIA labels** - Správne označenie pre screen readery
- **Keyboard navigation** - Plná podpora klávesnicovej navigácie
- **Focus management** - Správne spravovanie focusu
- **Color contrast** - Dodržanie kontrastných pomerov

## 🔍 SEO

- **Meta tags** - Kompletné meta tagy
- **Open Graph** - Social media sharing
- **Twitter Cards** - Twitter sharing
- **Structured data** - JSON-LD schema
- **Sitemap** - Automaticky generovaný sitemap
- **RSS feed** - RSS feed pre obsah

## 📊 Analytics

- **Google Analytics 4** - Web analytics
- **Consent management** - GDPR súhlas
- **Event tracking** - Tracking používateľských akcií
- **Performance monitoring** - Monitoring výkonu

## 🚀 Deployment

### AWS Amplify (Production)
Frontend je automaticky deploynutý cez AWS Amplify pri push do main branchu.

```bash
# Amplify deployment sa spustí automaticky pri:
git push origin main
```

### AWS Backend Services
Lambda funkcie sa deployujú manuálne:

```bash
# Deploy nasa-fetcher
cd aws/lambda/nasa-fetcher
zip -r nasa-fetcher.zip . -x "*.git*" "*.zip"
aws lambda update-function-code \
  --function-name infinite-nasa-apod-dev-nasa-fetcher \
  --zip-file fileb://nasa-fetcher.zip \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1

# Deploy content-processor
cd aws/lambda/content-processor
zip -r content-processor.zip . -x "*.git*" "*.zip"
aws lambda update-function-code \
  --function-name infinite-nasa-apod-dev-content-processor \
  --zip-file fileb://content-processor.zip \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1
```

### Manual Content Fetch
```bash
# Fetch latest APOD
./scripts/fetch-apod.sh

# Fetch specific date
./scripts/fetch-apod.sh 2025-10-01
```

## 🧪 Testovanie

```bash
# E2E testy
npm run test:e2e

# E2E testy s UI
npm run test:e2e:ui

# E2E testy s browserom
npm run test:e2e:headed
```

## 📈 Monitoring

### Frontend
- **Google Analytics 4** - User behavior a engagement
- **Core Web Vitals** - Performance monitoring
- **Error tracking** - Client-side error monitoring

### Backend (AWS)
- **CloudWatch Logs** - Lambda function logs
- **CloudWatch Metrics** - Performance metrics
- **EventBridge** - Scheduled task monitoring
- **DynamoDB Metrics** - Database performance
- **CloudFront Metrics** - CDN cache performance

```bash
# View Lambda logs
aws logs tail /aws/lambda/infinite-nasa-apod-dev-content-processor \
  --profile infinite-nasa-apod-dev --region eu-central-1 --follow
```

## 🤝 Contribúcia

1. Fork repozitára
2. Vytvorte feature branch (`git checkout -b feature/amazing-feature`)
3. Commit zmeny (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otvorte Pull Request

## 📄 Licencia

Tento projekt je licencovaný pod MIT licenciou - pozrite si [LICENSE](LICENSE) súbor pre detaily.

## 🏗️ Architektúra

### Data Flow
```
NASA API → nasa-fetcher Lambda → content-processor Lambda (OpenAI GPT-4) 
  → DynamoDB + S3 → API Gateway → Next.js Frontend → User
```

### AWS Resources
- **Region:** eu-central-1 (Frankfurt)
- **Lambda Functions:** 5 (nasa-fetcher, content-processor, api-latest, api-reprocess, s3-test)
- **DynamoDB Table:** infinite-nasa-apod-dev-content (56 entries)
- **S3 Bucket:** infinite-nasa-apod-dev-images-349660737637
- **CloudFront:** d2ydyf9w4v170.cloudfront.net
- **API Gateway:** l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com

### Daily Automation
- **04:05 UTC** - První automatický fetch
- **06:00 UTC** - Druhý automatický fetch (backup)
- NASA obvykle publikuje nový APOD okolo 05:05 UTC

## 📚 Dokumentácia

- **PROJECT_STATUS.md** - Aktuálny stav projektu a infraštruktúry
- **DATA_FETCH_TROUBLESHOOTING.md** - Troubleshooting guide pre data fetch
- **docs/architecture.md** - Detailná architektúra
- **docs/aws-setup.md** - AWS setup guide
- **docs/stories/** - 21 user stories pre implementáciu

## 🙏 Podakovanie

- [NASA](https://nasa.gov) - Za APOD API
- [OpenAI](https://openai.com) - Za GPT-4 content generation
- [Next.js](https://nextjs.org) - Za úžasný framework
- [AWS](https://aws.amazon.com) - Za serverless infrastructure
- [Tailwind CSS](https://tailwindcss.com) - Za CSS framework