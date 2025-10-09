import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { AnalyticsProvider } from "@/components/google-analytics"
import { AdManager } from "@/components/ad-manager"
import { Suspense } from "react"
import { SpaceLoading } from "@/components/space-loading"

export const metadata: Metadata = {
  title: "Infinite – Objav dňa z vesmíru",
  description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii.",
  generator: "v0.app",
  metadataBase: new URL("https://infinite.sk"),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
  },
  openGraph: {
    title: "Infinite – Objav dňa z vesmíru",
    description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii.",
    type: "website",
    locale: "sk_SK",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 1200,
        alt: 'Infinite - Objav dňa z vesmíru',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinite – Objav dňa z vesmíru",
    description: "Denné objavy, vizuálne snímky a vzdelávacie články o vesmíre a astronómii.",
    images: ['/opengraph-image.png'],
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
        <AnalyticsProvider>
          <AdManager>
            <Suspense fallback={<SpaceLoading />}>
              <Navigation />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </Suspense>
            <PerformanceMonitor />
            <Analytics />
          </AdManager>
        </AnalyticsProvider>
      </body>
    </html>
  )
}