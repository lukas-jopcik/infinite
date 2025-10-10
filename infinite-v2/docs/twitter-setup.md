# Twitter Setup Guide

## Prečo je Twitter dôležitý pre SEO?

Twitter účet je dôležitý pre SEO z niekoľkých dôvodov:

1. **Social Media SEO** - Twitter signály môžu ovplyvniť ranking
2. **Rich Snippets** - Twitter Card meta tagy sú už implementované
3. **Social Proof** - Overený účet zvyšuje dôveryhodnosť
4. **Content Distribution** - Šírenie obsahu na sociálnych sieťach

## Kroky na vytvorenie Twitter účtu

### 1. Vytvorenie účtu

1. Choďte na [twitter.com](https://twitter.com)
2. Kliknite na "Sign up"
3. Použite email: `info@infinite.sk` alebo podobný
4. Vyberte username: `@infinite_sk` (alebo podobný)
5. Dokončite registráciu

### 2. Optimalizácia profilu

**Nastavenia profilu:**
- **Name**: Infinite - Objav dňa z vesmíru
- **Bio**: Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii. 🌌✨
- **Location**: Slovensko
- **Website**: https://infinite.sk
- **Profile Picture**: Použite logo z `/public/icon.png`
- **Header Image**: Použite obrázok z vesmíru (1200x600px)

### 3. Overenie účtu

**Pre overenie potrebujete:**
- Telefónne číslo
- Email overenie
- Možno doklad totožnosti (pre blue checkmark)

**Kroky:**
1. Choďte do Settings → Account → Account information
2. Pridajte telefónne číslo
3. Overte email
4. Požiadajte o overenie účtu (voliteľné)

### 4. Aktualizácia konfigurácie

Po vytvorení účtu aktualizujte `SITE_CONFIG` v `/lib/config.ts`:

```typescript
export const SITE_CONFIG = {
  // ... existing config
  twitter: "@infinite_sk", // Aktualizujte na skutočný handle
  // ... rest of config
}
```

### 5. Testovanie Twitter Cards

**Testovanie:**
1. Choďte na [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Zadajte URL: `https://infinite.sk`
3. Skontrolujte, či sa zobrazujú správne Twitter Cards

**Očakávaný výsledok:**
- Title: "Infinite – Objav dňa z vesmíru"
- Description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii."
- Image: OpenGraph obrázok

### 6. Content Strategy

**Typy príspevkov:**
1. **Denné objavy** - zdieľanie nových článkov
2. **Astronomické fakty** - zaujímavé informácie
3. **Vizuálne snímky** - krásne obrázky z vesmíru
4. **Interakcia** - odpovede na komentáre, retweety

**Hashtags:**
- #vesmir
- #astronomia
- #nasa
- #esa
- #hubble
- #jwst
- #slovensko
- #objavdna

### 7. Automatizácia

**Možné riešenia:**
1. **IFTTT/Zapier** - automatické zdieľanie nových článkov
2. **Buffer/Hootsuite** - plánovanie príspevkov
3. **Custom script** - automatické zdieľanie z RSS feed

### 8. Monitoring

**Metriky na sledovanie:**
- Followers count
- Engagement rate
- Click-through rate na infinite.sk
- Retweets a likes

**Nástroje:**
- Twitter Analytics
- Google Analytics (social traffic)
- UTM parameters pre tracking

## Výhody pre SEO

1. **Social Signals** - Twitter aktivita môže ovplyvniť ranking
2. **Backlinks** - Ľudia môžu zdieľať vaše články
3. **Brand Awareness** - Zvýšenie povedomia o značke
4. **Rich Snippets** - Lepšie zobrazenie v search results
5. **Social Proof** - Overený účet zvyšuje dôveryhodnosť

## Ďalšie kroky

1. ✅ Vytvorte Twitter účet
2. ✅ Optimalizujte profil
3. ✅ Overte účet
4. ✅ Aktualizujte konfiguráciu
5. ✅ Testujte Twitter Cards
6. ✅ Začnite zdieľať obsah
7. ✅ Monitorujte výsledky

**Časový rámec:** 1-2 týždne na úplné nastavenie a overenie
