# API Troubleshooting Guide

## Problém: "Failed to fetch" error v search stránke

### Popis problému
Search stránka (`/hladat`) zobrazuje error "Failed to fetch" pri pokuse o načítanie článkov z API.

### Príčina
API server nie je spustený alebo nie je dostupný na `http://localhost:3001`.

### Riešenie

#### 1. Spustenie API servera
```bash
# V root adresári projektu
npm run dev:api
# alebo
yarn dev:api
```

#### 2. Kontrola API endpointov
Skontrolujte, či sú dostupné tieto endpointy:
- `GET /articles/latest?limit=50`
- `GET /articles/search?q=query&limit=100`
- `GET /articles/category/objav-dna?limit=25`
- `GET /articles/category/tyzdenny-vyber?limit=25`

#### 3. Environment variables
Skontrolujte `.env.local` súbor:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 4. Fallback riešenie
Search stránka má implementovaný fallback:
- Ak API nie je dostupné, použije client-side search
- Zobrazí informačnú správu používateľovi
- Umožní "Skúsiť znovu" tlačidlo

### Implementované vylepšenia

#### 1. Lepšie error handling
```typescript
// Fallback na client-side search
const performClientSideSearch = (searchQuery: string) => {
  const filtered = allArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.perex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.tags && article.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
  )
  setResults(filtered)
  setTotalCount(filtered.length)
}
```

#### 2. Víceúrovňový fallback
1. **Server-side search** - pokus o API search
2. **Client-side search** - fallback na lokálne vyhľadávanie
3. **Error handling** - informačná správa pre používateľa

#### 3. Lepšie UX
- Loading states
- Error messages
- Retry functionality
- Informative empty states

### Testovanie

#### 1. S API serverom
```bash
# Spustiť API server
npm run dev:api

# V inom termináli spustiť Next.js
npm run dev
```

#### 2. Bez API servera
- Search stránka by mala fungovať s client-side search
- Zobrazí sa informačná správa o nedostupnosti API
- Umožní základné vyhľadávanie v načítaných článkoch

### Monitoring

#### 1. Console logs
- API errors sa logujú do konzoly
- Fallback akcie sa logujú ako warnings

#### 2. Error states
- `error` state obsahuje popis problému
- `loading` state indikuje načítavanie
- `results` state obsahuje vyhľadávacie výsledky

### Ďalšie vylepšenia

#### 1. Offline support
- Service Worker pre offline funkcionalitu
- Cache API responses
- Offline search functionality

#### 2. Performance
- Debounced search
- Virtual scrolling pre veľké výsledky
- Lazy loading obrázkov

#### 3. Analytics
- Track search queries
- Monitor API availability
- Performance metrics

### Kontakt
Ak problémy pretrvávajú, kontaktujte vývojový tím s:
- Error logmi z konzoly
- Network tab informáciami
- Steps to reproduce
