# Infinite - NASA Fotka dňa v slovenčine

Moderná webová aplikácia pre zobrazovanie NASA Astronomy Picture of the Day (APOD) v slovenčine s optimalizovaným výkonom.

## 🚀 Funkcie

- **Optimalizovaný výkon** - Rýchle načítanie stránok s lazy loading a optimalizáciou obrázkov
- **Responsive dizajn** - Funguje na všetkých zariadeniach
- **SEO optimalizácia** - Plná podpora pre vyhľadávače
- **Accessibility** - Podporuje screen readery a klávesnicovú navigáciu
- **PWA ready** - Pripravené pre Progressive Web App
- **RSS feed** - Automaticky generovaný RSS feed
- **Sitemap** - Automaticky generovaný sitemap.xml

## 🛠️ Technológie

- **Next.js 14** - React framework s App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **WebGL** - Pre Aurora pozadie efekt
- **Vercel Analytics** - Web analytics
- **Playwright** - E2E testovanie

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

### Vercel (odporúčané)
```bash
# Inštalácia Vercel CLI
npm i -g vercel

# Deployment
vercel

# Production deployment
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t infinite .

# Run container
docker run -p 3000:3000 infinite
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

- **Vercel Analytics** - Web vitals a performance
- **Google Analytics** - User behavior
- **Error tracking** - Error monitoring
- **Performance monitoring** - Core Web Vitals

## 🤝 Contribúcia

1. Fork repozitára
2. Vytvorte feature branch (`git checkout -b feature/amazing-feature`)
3. Commit zmeny (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otvorte Pull Request

## 📄 Licencia

Tento projekt je licencovaný pod MIT licenciou - pozrite si [LICENSE](LICENSE) súbor pre detaily.

## 🙏 Podakovanie

- [NASA](https://nasa.gov) - Za APOD API
- [Next.js](https://nextjs.org) - Za úžasný framework
- [Vercel](https://vercel.com) - Za hosting a analytics
- [Tailwind CSS](https://tailwindcss.com) - Za CSS framework