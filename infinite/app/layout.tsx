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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk" className={inter.variable}>
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
