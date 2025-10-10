# Search Troubleshooting Guide

## Problém: Vyhľadávanie nefunguje

### Popis problému
Search stránka (`/hladat`) zobrazuje error "Failed to fetch" alebo nefunguje správne.

### Diagnostika

#### 1. Skontrolovať API server
```bash
# V root adresári projektu
cd /Users/jopcik/Desktop/infinite-v2

# Spustiť API server
npm run dev:api
# alebo
yarn dev:api
```

#### 2. Skontrolovať environment variables
```bash
# Skontrolovať .env.local súbor
cat infinite-v2/.env.local

# Mal by obsahovať:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 3. Testovať API endpointy
```bash
# Test latest articles
curl http://localhost:3001/articles/latest?limit=5

# Test search
curl "http://localhost:3001/articles/search?q=vesmír&limit=10"

# Test category
curl http://localhost:3001/articles/category/objav-dna?limit=5
```

### Riešenie problémov

#### Problém 1: API server nie je spustený
**Symptómy:**
- "Failed to fetch" error
- Network error v console

**Riešenie:**
1. Spustiť API server: `npm run dev:api`
2. Skontrolovať či beží na porte 3001
3. Skontrolovať environment variable `NEXT_PUBLIC_API_URL`

#### Problém 2: GSI indexy nie sú aktívne
**Symptómy:**
- Pomalé vyhľadávanie
- Timeout errory
- "GSI not ready" v logoch

**Riešenie:**
```bash
# Spustiť GSI diagnostický skript
./scripts/check-gsi-status.sh

# Ak nie sú aktívne, počkať alebo reštartovať DynamoDB
```

#### Problém 3: Chýbajúce tags v článkoch
**Symptómy:**
- Search nevyhľadáva v tags
- Neúplné výsledky

**Riešenie:**
1. Skontrolovať DynamoDB items majú tags pole
2. Reštartovať content processor
3. Reprocessovať články

#### Problém 4: Client-side fallback nefunguje
**Symptómy:**
- Prázdne výsledky aj keď sú články
- JavaScript errory

**Riešenie:**
1. Skontrolovať console errory
2. Overiť či sú články načítané v `allArticles`
3. Skontrolovať filter logiku

### Implementované vylepšenia

#### 1. Víceúrovňový fallback
```typescript
// 1. Server-side search (API)
const searchResponse = await ArticlesAPI.searchArticles(query, 100)

// 2. Client-side search (fallback)
const filtered = allArticles.filter(article => 
  article.title.toLowerCase().includes(query.toLowerCase()) ||
  article.perex.toLowerCase().includes(query.toLowerCase()) ||
  article.category.toLowerCase().includes(query.toLowerCase()) ||
  (article.tags && article.tags.some(tag => 
    tag.toLowerCase().includes(query.toLowerCase())
  ))
)
```

#### 2. Lepšie error handling
```typescript
try {
  // API search
} catch (apiError) {
  console.warn('API search failed, falling back to client-side search:', apiError)
  // Fallback to client-side search
  performClientSideSearch(searchQuery)
}
```

#### 3. Environment validation
```typescript
// Automatická kontrola environment variables
const env = checkEnvironment()
if (env.missingVars.length > 0) {
  console.warn('Missing environment variables:', env.missingVars)
}
```

### Testovanie

#### 1. S API serverom
```bash
# Spustiť API server
npm run dev:api

# V novom termináli spustiť frontend
cd infinite-v2
npm run dev

# Testovať search na http://localhost:3000/hladat
```

#### 2. Bez API servera (fallback)
```bash
# Spustiť len frontend
cd infinite-v2
npm run dev

# Search by mal fungovať s client-side fallback
```

#### 3. GSI test
```bash
# Spustiť GSI diagnostiku
./scripts/check-gsi-status.sh

# Očakávané výstupy:
# ✅ type-originalDate-index - Found
# ✅ slug-index - Found  
# ✅ category-originalDate-index - Found
```

### Monitoring

#### 1. Console logy
```javascript
// V browser console sledovať:
// - API requesty
// - Fallback aktiváciu
// - Error správy
```

#### 2. Network tab
```javascript
// Sledovať:
// - API response times
// - Failed requests
// - CORS errory
```

#### 3. DynamoDB CloudWatch
```bash
# Sledovať:
# - GSI throttling
# - Read/Write capacity
# - Error rates
```

### Bežné chyby a riešenia

#### Error: "Failed to fetch"
**Príčina:** API server nie je dostupný
**Riešenie:** Spustiť `npm run dev:api`

#### Error: "GSI not ready"
**Príčina:** GSI indexy sú v stave CREATING/UPDATING
**Riešenie:** Počkať na dokončenie alebo reštartovať

#### Error: "CORS error"
**Príčina:** Nesprávne CORS nastavenie
**Riešenie:** Skontrolovať API headers

#### Error: "Empty results"
**Príčina:** Chýbajúce data alebo nesprávny filter
**Riešenie:** Skontrolovať DynamoDB items a filter logiku

### Performance optimalizácie

#### 1. GSI optimalizácia
- Používať GSI namiesto Scan operácií
- Implementovaný fallback na Scan ak GSI nie je dostupný

#### 2. Caching
- Client-side caching pre `allArticles`
- API response caching (plánované)

#### 3. Pagination
- Implementovaná pagination pre veľké výsledky
- Configurable `ARTICLES_PER_PAGE`

### Kontakt a podpora

Pre ďalšie problémy:
1. Skontrolovať console logy
2. Spustiť GSI diagnostiku
3. Testovať API endpointy
4. Skontrolovať environment variables
