import { ArticleData, generateArticleStructuredData, generateWebsiteStructuredData, generateOrganizationStructuredData, generateBreadcrumbStructuredData } from "@/lib/seo"

interface StructuredDataProps {
  data: object
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  )
}

interface ArticleStructuredDataProps {
  article: ArticleData
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const structuredData = generateArticleStructuredData(article)
  return <StructuredData data={structuredData} />
}

interface WebsiteStructuredDataProps {
  includeOrganization?: boolean
}

export function WebsiteStructuredData({ includeOrganization = true }: WebsiteStructuredDataProps) {
  const websiteData = generateWebsiteStructuredData()
  const organizationData = includeOrganization ? generateOrganizationStructuredData() : null

  return (
    <>
      <StructuredData data={websiteData} />
      {organizationData && <StructuredData data={organizationData} />}
    </>
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{ name: string; url: string }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = generateBreadcrumbStructuredData(items)
  return <StructuredData data={structuredData} />
}
