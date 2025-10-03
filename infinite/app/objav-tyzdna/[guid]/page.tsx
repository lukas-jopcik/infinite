import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/date"
import { generateHubbleMetadata } from "@/lib/seo"
import { Prose } from "@/components/Prose"
import ArticleContent from "@/components/ArticleContent"
import { getHubbleByGuidFromApi, getPreviousHubbleFromApi, getNeighborsHubbleFromApi } from "@/lib/hubble-api"
import { HubbleCard } from "@/components/HubbleCard"
import SourceLink from "@/components/SourceLink"
import DetailNav from "@/components/DetailNav"
import { OptimizedImage } from "@/components/OptimizedImage"
import { trackEvent } from "@/lib/analytics"

interface HubbleDetailPageProps {
  params: Promise<{
    guid: string
  }>
}

// Helper function to parse FAQ text into schema.org format
function parseFaqToSchema(faqText: string) {
  const questions = [];
  const lines = faqText.split('\n');
  let currentQuestion = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('**Q:')) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: trimmed.replace('**Q:', '').replace('**', '').trim(),
        answer: ''
      };
    } else if (trimmed.startsWith('**A:') && currentQuestion) {
      currentQuestion.answer = trimmed.replace('**A:', '').replace('**', '').trim();
    } else if (currentQuestion && trimmed && !trimmed.startsWith('**')) {
      currentQuestion.answer += (currentQuestion.answer ? ' ' : '') + trimmed;
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

export async function generateMetadata({ params }: HubbleDetailPageProps) {
  const { guid } = await params
  const hubble = await getHubbleByGuidFromApi(guid)
  if (!hubble) {
    return {
      title: 'Hubble Obrázok nenájdený | Infinite',
    }
  }
  return generateHubbleMetadata(hubble)
}

export default async function HubbleDetailPage({ params }: HubbleDetailPageProps) {
  const { guid } = await params
  const hubble = await getHubbleByGuidFromApi(guid)
  if (!hubble) notFound()
  
  const previous = await getPreviousHubbleFromApi(hubble.pubDate, 3)
  const { newer, older } = await getNeighborsHubbleFromApi(hubble.pubDate)

  return (
    <article className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <nav aria-label="Breadcrumb">
          <Link href="/objav-tyzdna" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8" aria-label="Späť na Objav týždňa">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Späť na Objav týždňa
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{hubble.title}</h1>
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <time dateTime={hubble.pubDate.split('T')[0]} className="text-lg">{formatDate(hubble.pubDate.split('T')[0])}</time>
            <span
              className="inline-flex items-center bg-black/30 border border-white/5 text-gray-200/90 text-xs px-2.5 py-0.5 rounded-md"
              aria-label="Článok generovaný AI"
              title="Text článku bol pripravený s pomocou AI"
            >
              AI generované
            </span>
          </div>
        </header>

        <div className="mb-8">
          {hubble.image_main && (
            <figure className="relative aspect-video rounded-lg overflow-hidden">
              <OptimizedImage
                src={hubble.image_main}
                alt={`${hubble.title} - ESA Hubble Space Telescope obrázok`}
                className="w-full h-full object-cover"
                priority={true}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              <figcaption className="sr-only">{hubble.title} - ESA Hubble Space Telescope obrázok</figcaption>
            </figure>
          )}
        </div>

        <div className="mb-8">
          {hubble.seoArticle?.article ? (
            <ArticleContent content={hubble.seoArticle.article} />
          ) : (
            <Prose>
              <div dangerouslySetInnerHTML={{ __html: hubble.description }} />
            </Prose>
          )}
        </div>

        <div className="mb-8">
          <SourceLink 
            href={hubble.link} 
            label="ESA Hubble" 
            title="Pôvodný článok na ESA Hubble webe"
          />
        </div>

        {hubble.seoArticle?.faq && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Často kladené otázky</h2>
            <div className="space-y-6">
              {parseFaqToSchema(hubble.seoArticle.faq).map((faq, index) => (
                <div key={index} className="border border-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hubble.seoArticle?.conclusion && (
          <div className="mb-8">
            <Prose>
              <div dangerouslySetInnerHTML={{ __html: hubble.seoArticle.conclusion }} />
            </Prose>
          </div>
        )}

        <DetailNav newer={newer} older={older} basePath="/objav-tyzdna" />

        {previous.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Súvisiace Hubble obrázky</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previous.map((item) => (
                <HubbleCard key={item.guid} hubble={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": hubble.title,
            "description": hubble.excerpt,
            "image": hubble.image_main,
            "datePublished": hubble.pubDate,
            "dateModified": hubble.pubDate,
            "author": {
              "@type": "Organization",
              "name": "ESA Hubble Space Telescope"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Infinite",
              "logo": {
                "@type": "ImageObject",
                "url": "https://infinite.example/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://infinite.example/hubble/${hubble.guid}`
            },
            ...(hubble.seoArticle?.faq && {
              "mainEntity": {
                "@type": "FAQPage",
                "mainEntity": parseFaqToSchema(hubble.seoArticle.faq).map(faq => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              }
            })
          })
        }}
      />
    </article>
  )
}
