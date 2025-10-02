import type React from "react"
import { Inter } from "next/font/google"
import { ClientLayout } from "@/components/ClientLayout"
import Analytics from "@/components/Analytics"
import { Suspense } from "react"
import "./globals.css"
import ConsentBanner from "@/components/ConsentBanner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
})

export const metadata = {
  title: "Infinite - Nekonečné objavy, každý deň",
  description: "Objavujte vesmír každý deň s NASA Astronomy Picture of the Day",
  openGraph: {
    title: "Infinite - Nekonečné objavy, každý deň",
    description: "Objavujte vesmír každý deň s NASA Astronomy Picture of the Day",
    url: process.env.SITE_URL || "https://infinite.vercel.app",
    siteName: "Infinite",
    locale: "sk_SK",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Infinite',
      url: 'https://infinite.example',
      logo: 'https://infinite.example/logo.png',
      description: 'Objavujte vesmír každý deň s NASA Astronomy Picture of the Day',
      sameAs: [
        'https://twitter.com/infinite_apod',
        'https://facebook.com/infinite.apod'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'info@infinite.example'
      }
    })
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="sk" className={inter.variable}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7836061933361865"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <ConsentBanner />
      </body>
    </html>
  )
}
