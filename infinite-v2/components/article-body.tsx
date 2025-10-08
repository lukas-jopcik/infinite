interface ArticleBodyProps {
  content?: string
}

export function ArticleBody({ }: ArticleBodyProps) {
  return (
    <div className="prose prose-lg prose-invert max-w-none">
      <div className="space-y-6 text-foreground">
        <h2 className="text-2xl font-bold text-foreground">Úvod</h2>
        <p className="leading-relaxed text-muted-foreground">
          Tento článok prináša podrobný pohľad na fascinujúci vesmírny jav. Vedci a astronómovia z celého sveta
          spolupracujú na výskume týchto úkazov, aby lepšie pochopili fungovanie vesmíru.
        </p>

        <h2 className="text-2xl font-bold text-foreground">Hlavné zistenia</h2>
        <p className="leading-relaxed text-muted-foreground">
          Najnovšie pozorovania odhalili prekvapivé detaily, ktoré môžu zmeniť naše chápanie vesmíru. Tieto objavy sú
          výsledkom rokov výskumu a spolupráce medzinárodných tímov.
        </p>

        <blockquote className="border-l-4 border-accent pl-6 italic text-muted-foreground">
          &quot;Každý nový objav nás približuje k pochopeniu tajomstiev vesmíru a našej pozície v ňom.&quot;
        </blockquote>

        <h2 className="text-2xl font-bold text-foreground">Čo to znamená pre vedu?</h2>
        <p className="leading-relaxed text-muted-foreground">
          Tieto zistenia majú významné implikácie pre našu budúcnosť a pochopenie vesmíru. Vedci pokračujú v analýze dát
          a plánujú ďalšie pozorovania.
        </p>

        <h2 className="text-2xl font-bold text-foreground">Často kladené otázky</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Ako bol tento objav urobený?</h3>
            <p className="leading-relaxed text-muted-foreground">
              Objav bol urobený pomocou najmodernejších teleskopov a technológií, ktoré umožňujú pozorovať vesmír s
              bezprecedentnou presnosťou.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Prečo je to dôležité?</h3>
            <p className="leading-relaxed text-muted-foreground">
              Tento objav nám pomáha lepšie pochopiť fungovanie vesmíru a môže viesť k ďalším prelomovým zisteniam v
              budúcnosti.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
