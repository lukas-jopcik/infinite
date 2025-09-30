import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example'),
  title: {
    default: 'Infinite - Nekonečné objavy, každý deň',
    template: '%s | Infinite'
  },
  description: 'Objavujte vesmír každý deň s NASA Astronomy Picture of the Day',
  keywords: ['NASA', 'APOD', 'astronómia', 'vesmír', 'fotka dňa', 'slovenčina'],
  authors: [{ name: 'Infinite' }],
  creator: 'Infinite',
  publisher: 'Infinite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example',
    siteName: 'Infinite',
    title: 'Infinite - Nekonečné objavy, každý deň',
    description: 'Objavujte vesmír každý deň s NASA Astronomy Picture of the Day',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Infinite - NASA Fotka dňa v slovenčine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infinite - Nekonečné objavy, každý deň',
    description: 'Objavujte vesmír každý deň s NASA Astronomy Picture of the Day',
    images: ['/og-image.jpg'],
    creator: '@infinite',
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
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.example',
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Infinite RSS Feed' },
      ],
    },
  },
}