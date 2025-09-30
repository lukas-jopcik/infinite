export interface MockContent {
  introduction: string
  expandedContent: string
  tags: string[]
  readingTime: number
}

// Slovak mock content database
const mockContentDatabase: Record<string, MockContent> = {
  // Default fallback content
  default: {
    introduction:
      "Vesmír nás každý deň prekvapuje svojou nesmiernou krásou a tajomstvami, ktoré čakają na svoje odhalenie.",
    expandedContent:
      "Táto fascinujúca snímka nám pripomína, aké malí sme vo vesmírnom meradle, ale zároveň aké privilegovaní, že môžeme obdivovať tieto kosmické divy. Každý deň prináša nové objavy a pohľady na náš vesmír, ktoré rozširujú naše chápanie reality okolo nás.\n\nAstronomické pozorovania ako toto nám umožňují nahliadnuť do hlbín vesmíru a pochopiť procesy, ktoré formovali a stále formujú náš kozmos. Je to pripomienka toho, že sme súčasťou niečoho oveľa väčšieho a úžasnejšieho, než si dokážeme predstaviť.",
    tags: ["vesmír", "astronómia", "objavy"],
    readingTime: 3,
  },

  // Content for different types of astronomical objects
  galaxy: {
    introduction:
      "Galaxie sú obrovské sústavy hviezd, plynov a prachu, ktoré predstavujú základné stavebné kamene nášho vesmíru.",
    expandedContent:
      "Každá galaxia je domovom miliárd hviezd a predstavuje fascinujúci svet plný tajomstiev. Tieto kozmické ostrovy sa rozprestierajú na vzdialenosti miliónov svetelných rokov a každá z nich má svoju jedinečnú históriu a charakteristiky.\n\nPozorovanie galaxií nám umožňuje pochopiť, ako sa vesmír vyvíjal počas miliárd rokov. Od špirálových galaxií s ich elegantnými ramenami až po eliptické galaxie s ich pokojným vzhľadom - každá forma nám rozpráva príbeh o kozmickej evolúcii.\n\nModerné teleskopy nám odhaľujú stále nové detaily o týchto vzdialených svetoch, čím rozširujú naše chápanie štruktúry a histórie vesmíru.",
    tags: ["galaxie", "hviezdy", "vesmírna štruktúra"],
    readingTime: 4,
  },

  nebula: {
    introduction:
      "Hmlovina sú jedny z najkrajších objektov na nočnej oblohe - kozmické ateliéry, kde sa rodia nové hviezdy.",
    expandedContent:
      "Tieto farebnými plynmi a prachom naplnené oblasti predstavujú miesta intenzívnej hviezdnej aktivity. V ich útrobách prebiehajú procesy, ktoré vedú k vzniku nových hviezd a planetárnych systémov.\n\nRôzne typy hmlovín nám ukazujú rôzne fázy hviezdneho života. Emisné hmlovina žiaria vlastným svetlom vďaka energii mladých hviezd, zatiaľ čo reflexné hmlovina odrážajú svetlo blízkych hviezd ako kozmické zrkadlá.\n\nPlanetárne hmlovina zase predstavujú posledné vzdychy umierajúcich hviezd, ktoré do vesmíru vypúšťajú svoje vonkajšie vrstvy a vytvárajú tak úchvatné kozmické umelecké diela.",
    tags: ["hmlovina", "hviezdy", "kozmické farby"],
    readingTime: 4,
  },

  planet: {
    introduction:
      "Planéty našej slnečnej sústavy sú fascinujúce svety, každý s jedinečnými charakteristikami a tajomstvami.",
    expandedContent:
      "Od vyprahnutých púští Marsu až po búrlivé atmosféry plynových obrov - každá planéta nám ponúka jedinečný pohľad na rozmanitosť kozmických prostredí. Tieto nebeské telá sú výsledkom miliárd rokov evolúcie a každé z nich má svoj vlastný príbeh.\n\nModerné vesmírne misie nám umožňujú preskúmať tieto vzdialené svety s bezprecedentnou presnosťou. Objavujeme podzemné oceány, aktívne sopky, komplexné atmosférické systémy a možno aj stopy života.\n\nŠtúdium planét nám pomáha lepšie pochopiť nielen našu slnečnú sústavu, ale aj tisíce exoplanét objavených okolo iných hviezd, čím rozširujeme naše chápanie možností života vo vesmíre.",
    tags: ["planéty", "slnečná sústava", "prieskum vesmíru"],
    readingTime: 4,
  },

  star: {
    introduction:
      "Hviezdy sú kozmické elektrárne, ktoré svojím svetlom a energiou umožňujú existenciu života vo vesmíre.",
    expandedContent:
      "Tieto žiariace gule plazmy predstavujú srdce každej galaxie a sú zodpovedné za tvorbu všetkých ťažších prvkov vo vesmíre. V ich jadrách prebiehajú termonukleárne reakcie, ktoré pretvárajú vodík na hélium a uvoľňujú obrovské množstvo energie.\n\nŽivotný cyklus hviezd je jedným z najfascinujúcejších procesov vo vesmíre. Od ich narodenia v hmlovina až po spektakulárny koniec v podobe supernovy alebo pokojného prechodu na bieleho trpaslíka - každá fáza prináša nové poznatky o fungovaní vesmíru.\n\nRôzne typy hviezd nám ukazujú rozmanitosť kozmických procesov. Červení obri, neutronové hviezdy, čierne diery - každý z týchto objektov predstavuje extrémne prostredie, ktoré testuje naše chápanie fyziky.",
    tags: ["hviezdy", "nukleárne reakcie", "kozmická evolúcia"],
    readingTime: 5,
  },
}

// Function to determine content type based on title and description
function getContentType(title: string, explanation: string): string {
  const text = (title + " " + explanation).toLowerCase()

  if (text.includes("galaxy") || text.includes("galaxie") || text.includes("galactic")) return "galaxy"
  if (text.includes("nebula") || text.includes("hmlovina") || text.includes("cloud")) return "nebula"
  if (text.includes("planet") || text.includes("mars") || text.includes("jupiter") || text.includes("saturn"))
    return "planet"
  if (text.includes("star") || text.includes("stellar") || text.includes("hviezda") || text.includes("sun"))
    return "star"

  return "default"
}

// Function to get mock content for an APOD
export function getMockContent(title: string, explanation: string): MockContent {
  const contentType = getContentType(title, explanation)
  return mockContentDatabase[contentType] || mockContentDatabase.default
}

// Function to enhance APOD explanation with Slovak content
export function enhanceApodContent(title: string, originalExplanation: string): string {
  const mockContent = getMockContent(title, originalExplanation)

  // Create enhanced content with Slovak introduction and expanded content
  const enhancedContent = [mockContent.introduction, "", originalExplanation, "", mockContent.expandedContent].join(
    "\n",
  )

  return enhancedContent
}

// Function to get reading time
export function getReadingTime(title: string, explanation: string): number {
  const mockContent = getMockContent(title, explanation)
  return mockContent.readingTime
}

// Function to get tags
export function getTags(title: string, explanation: string): string[] {
  const mockContent = getMockContent(title, explanation)
  return mockContent.tags
}
