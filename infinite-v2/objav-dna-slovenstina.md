# 🧠 AI PROMPT: **Generovanie článkov „Objav dňa“ zo zdroja APOD**

## 🎯 Účel
Na základe dát z `https://apod.com/feed.rss` vytvor **plnohodnotný článok v slovenskom jazyku**, určený na web **Infinite – Objav dňa**.  
Text musí byť **gramaticky a štylisticky správny**, pútavý, informatívny a v súlade so SEO štandardmi (Google Discover / News).

---

## 📦 Vstupné dáta (`apod_item`)
```json
{
  "title": "Butterfly Nebula from Hubble",
  "link": "https://apod.com/apod/ap250107.html",
  "description": "<p>...</p>", 
  "pubDate": "Tue, 07 Oct 2025 00:00:00 GMT",
  "media_url": "https://apod.nasa.gov/apod/image/2501/ButterflyNebula_Hubble_960.jpg",
  "media_type": "image",
  "copyright": "NASA / ESA / Hubble Heritage Team",
  "credit": "APOD / NASA"
}
```

---

## 🧩 Inštrukcie pre generovanie

### 🔹 Jazyk & štýl
- Jazyk: **slovenčina**
- Štýl: populárno-náučný, zrozumiteľný pre bežného čitateľa (úroveň B2)
- Gramatika: dodržuj **slovenskú syntax, skloňovanie, správne diakritiku**
- Odporúčaný tón: **pútavý, ale faktický** (nie clickbait, nie prehnaný)
- Každá veta má byť **zmysluplná a prirodzená** – vyhýbaj sa prekladu doslova z angličtiny.

---

## 📖 Štruktúra článku (povinná)

### `<title>` (Meta Title)
- max. 60 znakov  
- jasný, pútavý, ale pravdivý  
- použijem vzorec:  
  ```
  [Zaujímavý jav / objekt] – Objav dňa [deň. mesiac slovne, rok]
  ```
  **Príklad:**  
  „Motýlia hmlovina – Objav dňa 7. októbra 2025“

---

### `<meta name="description">`
- max. 155 znakov  
- krátky prehľad deja článku  
- začni dynamickým slovesom: „Pozrite sa“, „Zistite“, „Preskúmajte“  
- **Príklad:**  
  „Pozrite sa, ako teleskop Hubble zachytil fascinujúcu hmlovinu v tvare motýľa.“

---

### `<h1>` – hlavný nadpis článku
- rovnaký ako `<title>`, ale bez dátumu  
  **Príklad:**  
  „Motýlia hmlovina – fascinujúce okno do konca života hviezdy“

---

### Perex (1–2 vety)
Krátky úvod, ktorý čitateľa vtiahne.  
- odpovedá na otázku *„Prečo by ma to malo zaujímať?“*  
- plynule prejde do hlavného obsahu.  
**Príklad:**  
> Obloha dokáže byť krásna aj vo chvíľach, keď hviezda zomiera.  
> Dnešný Objav dňa prináša ohromujúci pohľad na Motýliu hmlovinu – zvyšok hviezdy, ktorá kedysi svietila ako Slnko.

---

### H2 SEKCIE (povinné, v tomto poradí)

#### 🪐 1. Čo vidíme na snímke
- jasne a stručne vysvetli, čo sa nachádza na fotografii  
- použite konkrétne názvy (napr. „emisná hmlovina“, „supernova“, „plynové oblaky“)  
- pridaj laické vysvetlenie: *čo to znamená, ako to vzniká, ako to vyzerá*  
- používaj slovenské astronomické termíny (napr. „hmlovina“, „galaxia“, „zhluk hviezd“)

#### 🌌 2. Prečo je tento objav dôležitý
- vysvetli, aký má snímka význam pre astronómiu alebo poznanie vesmíru  
- prepoj to s ľudským aspektom: *čo sa tým dozvedáme o sebe alebo o Zemi*  
- vyhni sa klišé („unikátna fotografia“, „ohromujúci objav“)  
- použi fakty: „vďaka tejto snímke môžeme lepšie pochopiť...“

#### 🔭 3. Ako záber vznikol
- ak sú v APOD opise detaily o technike, vysvetli ich jednoducho  
  - napr. „Záber vznikol kombináciou viacerých expozícií v rôznych vlnových dĺžkach svetla.“  
- ak údaje chýbajú, napíš všeobecne:  
  - „Snímka bola zachytená pomocou Hubbleovho vesmírneho teleskopu, ktorý pozoruje objekty vo viditeľnom aj infračervenom spektre.“

#### 🌠 4. Zaujímavosti o objekte
- pridaj 3–5 faktov vo forme zoznamu  
  - fyzikálne údaje (vzdialenosť, veľkosť, vek)  
  - historické fakty (kedy bola objavená, kým bola pomenovaná)  
  - zaujímavosti (napr. tvar pripomína motýľa, srdce, prstene)

#### ❓ 5. Často kladené otázky (FAQ)
Formát `<dl>` – otázky, ktoré by si mohol položiť laik:  
- Čo je to hmlovina?  
- Ako ďaleko sa nachádza?  
- Ako sa snímka spracováva?  

Odpovede musia byť krátke, faktické a jazykovo čisté.

---

### 🖼️ Obrázky
- **Primary image:** `apod_item.media_url` (prevedená na `.webp`, 1200px width)  
  - `alt`: presný popis objektu (napr. „Hmlovina v tvare motýľa zachytená Hubbleovým teleskopom“)  
  - `title`: zjednodušený názov (napr. „Motýlia hmlovina – Objav dňa“)  
  - `figcaption`: „Zdroj: APOD / NASA / ESA“  
- **Secondary image:**  
  - vyber z NASA/ESA open galérií alebo použij vyhľadávací dopyt  
  - ak sa nedá dohľadať, vlož `TODO: secondary image query`

---

### 🧾 Záver článku
- krátke zhrnutie v 2–3 vetách  
- zakonči výzvou na akciu:  
  > „Chceš vidieť viac takýchto záberov? Sleduj každý deň náš *Objav dňa* – nekonečný zdroj krásy a poznania.“

- potom:  
  > „Zdroj: apod.com (Astronomy Picture of the Day), licencia public domain.“

---

## 🧠 Pokyny pre AI spracovanie
- zachovaj **fakty presne** podľa APOD popisu, ale preformuluj do plynulej slovenčiny  
- **neprekladaj mená teleskopov, misií, katalógov** (ponechaj anglické)  
- kontroluj **skloňovanie a rod:**  
  - správne tvary ako *„táto galaxia“, „v tejto hmlovine“, „vzdialená planéta“*  
- vyhni sa prekladovým chybám typu „tento hviezdny plyn bol vyrobený“  
  → správne: „tento plyn vznikol po výbuchu hviezdy“  

---

## ⚙️ Technické požiadavky
- Dĺžka textu: **500–900 slov**  
- Obsah musí byť **HTML validný**, s odseky `<p>` a nadpismi `<h2>`  
- Použi **UTF-8** a zachovaj diakritiku  
- Na konci vlož `<!--VALIDATED: OK-->` ak všetky sekcie boli vygenerované  

---

## ✅ Self-check pred publikovaním
| Kontrola | Podmienka |
|-----------|------------|
| ✅ Slovenská gramatika a syntax | Bez chýb, prirodzený slovosled |
| ✅ Nadpis a meta title odlišné, ale konzistentné | Áno |
| ✅ Všetky H2 sekcie prítomné | 5 |
| ✅ Obrázky s alt/title/credit | 2 |
| ✅ Žiadne anglické frázy typu “image credit”, “amazing” | Áno |
| ✅ Dĺžka 500–900 slov | Áno |
| ✅ Záver obsahuje výzvu + zdroj | Áno |
| ✅ Validný JSON-LD a OG | Áno |

---

## 📄 Výstup
AI má vrátiť **kompletný HTML článok** s:
- `<head>` (meta + og + json-ld)
- `<article>` (so štruktúrou podľa vyššie uvedených sekcií)
- komentárom `<!--VALIDATED: OK-->`  
Žiadne iné poznámky mimo HTML.

---

> 📁 Súbor ulož ako `/docs/ai/prompts/objav-dna-slovenstina.md`
