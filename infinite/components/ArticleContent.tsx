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
    if (text) {
      elements.push(
        <p key={`p-${elements.length}`}>{text}</p>
      )
    }
    paragraphLines = []
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    const isBlank = line.trim() === ""
    if (headingMatch) {
      flushParagraph()
      const hashes = headingMatch[1].length
      const title = headingMatch[2].trim()
      const Tag = hashes <= 2 ? "h2" : hashes === 3 ? "h3" : "h4"
      elements.push(
        <Tag key={`h-${elements.length}`}>{title}</Tag> as unknown as React.ReactNode
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

  return <div className={`prose max-w-none ${className}`}>{elements}</div>
}

export default ArticleContent


