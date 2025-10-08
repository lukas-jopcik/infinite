import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Infinite – Objav dňa z vesmíru",
  description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii.",
  generator: "v0.app",
  metadataBase: new URL("https://infinite.sk"),
  openGraph: {
    title: "Infinite – Objav dňa z vesmíru",
    description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii.",
    type: "website",
    locale: "sk_SK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinite – Objav dňa z vesmíru",
    description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
