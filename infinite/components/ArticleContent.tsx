import type React from "react"

type ArticleContentProps = {
  content: string
  className?: string
}

export function ArticleContent({ content, className = "" }: ArticleContentProps) {
  const elements: React.ReactNode[] = []

  const lines = (content || "").split(/\r?\n/)
  let paragraphLines: string[] = []

  function flushParagraph() {
    if (paragraphLines.length === 0) return
    const text = paragraphLines.join("\n").trim()
    if (!text) {
      paragraphLines = []
      return
    }

    // Check if the paragraph text matches the bullet point pattern
    // This pattern looks for items separated by " - " with bold text followed by a colon
    // Example: **James Webb Space Telescope**: Plánovaný... - **Artemis program**: Vrátenie...
    const bulletPointPattern = /.*\*\*.*?\*\*:\s*.*?(\s*-\s*\*\*.*?\*\*:\s*.*?)+/;
    const hasMultipleBulletPoints = (text.match(/\s*-\s*\*\*.*?\*\*:/g) || []).length >= 1;
    
    if (bulletPointPattern.test(text) || hasMultipleBulletPoints) {
      const items = text.split(/\s*-\s*/).map(item => item.trim()).filter(item => item.length > 0);
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-4 text-gray-300">
          {items.map((item, index) => (
            <li key={`li-${elements.length}-${index}`} className="mb-2 last:mb-0">
              {renderTextWithFormatting(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      // Regular paragraph
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
          {renderTextWithFormatting(text)}
        </p>
      )
    }
    paragraphLines = []
  }

  function renderTextWithFormatting(text: string) {
    // Handle bold text **text** and convert to <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2)
        return <strong key={index} className="font-semibold text-white">{boldText}</strong>
      }
      return part
    })
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    const boldHeadingMatch = line.match(/^\*\*(.*?)\*\*:\s*$/) // **Heading**: pattern
    const numberedListMatch = line.match(/^(\d+)\.\s+(.*)$/) // 1. Item pattern
    const isBlank = line.trim() === ""
    
    if (headingMatch) {
      flushParagraph()
      const hashes = headingMatch[1].length
      const title = headingMatch[2].trim()
      const Tag = hashes <= 2 ? "h2" : hashes === 3 ? "h3" : "h4"
      elements.push(
        <Tag key={`h-${elements.length}`} className="text-xl font-bold text-white mb-4 mt-6 first:mt-0">
          {title}
        </Tag> as unknown as React.ReactNode
      )
      continue
    }
    
    if (boldHeadingMatch) {
      flushParagraph()
      const title = boldHeadingMatch[1].trim()
      elements.push(
        <h3 key={`h-${elements.length}`} className="text-lg font-bold text-white mb-3 mt-5 first:mt-0">
          {title}
        </h3>
      )
      continue
    }
    
    if (numberedListMatch) {
      flushParagraph() // Flush any preceding paragraph
      const itemText = line.trim() // Keep the full line for numbered list item
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal pl-5 mb-4 text-gray-300">
          <li key={`li-${elements.length}-0`} className="mb-2 last:mb-0">
            {renderTextWithFormatting(itemText)}
          </li>
        </ol>
      )
      continue
    }
    
    if (isBlank) {
      flushParagraph()
      continue
    }
    paragraphLines.push(line)
  }

  flushParagraph()

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {elements}
    </div>
  )
}

export default ArticleContent


