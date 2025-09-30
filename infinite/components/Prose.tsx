import type React from "react"
interface ProseProps {
  children: React.ReactNode
  className?: string
}

export function Prose({ children, className = "" }: ProseProps) {
  return <div className={`prose max-w-none ${className}`}>{children}</div>
}
