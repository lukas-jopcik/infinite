/**
 * Application Configuration
 * Environment variables and constants
 */

// Google Analytics 4 (GA4) Configuration
export const GA_CONFIG = {
  trackingId: process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX',
  enabled: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID !== 'G-XXXXXXXXXX'
}

// Google Site Verification Configuration
export const GOOGLE_VERIFICATION_CONFIG = {
  siteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
  enabled: process.env.NODE_ENV === 'production' && !!process.env.GOOGLE_SITE_VERIFICATION
}

// Google AdSense Configuration
export const ADSENSE_CONFIG = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-xxxxxxxxxx',
  slots: {
    header: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER || 'xxxxxxxxxx',
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || 'xxxxxxxxxx',
    footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || 'xxxxxxxxxx',
    article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE || 'xxxxxxxxxx'
  },
  enabled: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ADSENSE_CLIENT !== 'ca-pub-xxxxxxxxxx'
}

// Affiliate Marketing Configuration
export const AFFILIATE_CONFIG = {
  dogNetId: process.env.NEXT_PUBLIC_DOGNET_AFFILIATE_ID || 'your_affiliate_id',
  enabled: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DOGNET_AFFILIATE_ID !== 'your_affiliate_id'
}

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-api-gateway-url.amazonaws.com/prod',
  timeout: 10000,
  retries: 3
}

// Site Configuration
export const SITE_CONFIG = {
  name: 'Infinite',
  description: 'Objav dňa z vesmíru',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://infinite.sk',
  locale: 'sk-SK',
  timezone: 'Europe/Bratislava'
}

// Content Configuration
export const CONTENT_CONFIG = {
  categories: [
    { slug: 'objav-dna', name: 'Objav dňa', description: 'Denné objavy z vesmíru' },
    { slug: 'komunita', name: 'Komunita', description: 'Články od komunity' },
    { slug: 'deti-a-vesmir', name: 'Deti & Vesmír', description: 'Astronómia pre deti' },
    { slug: 'vzdelavanie', name: 'Vzdelávanie', description: 'Vzdelávacie materiály' },
    { slug: 'technologie', name: 'Technológie', description: 'Vesmírne technológie' }
  ],
  defaultCategory: 'objav-dna',
  articlesPerPage: 12,
  maxRelatedArticles: 6
}

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  imageOptimization: {
    quality: 85,
    formats: ['webp', 'avif'] as const,
    sizes: {
      hero: { width: 1200, height: 675 },
      card: { width: 400, height: 225 },
      thumbnail: { width: 200, height: 112 }
    }
  },
  caching: {
    static: 31536000, // 1 year
    dynamic: 3600, // 1 hour
    api: 300 // 5 minutes
  }
}

// Analytics Events Configuration
export const ANALYTICS_EVENTS = {
  // Content engagement
  ARTICLE_VIEW: 'article_view',
  ARTICLE_READ_TIME: 'article_read_time',
  ARTICLE_SHARE: 'article_share',
  ARTICLE_BOOKMARK: 'article_bookmark',
  
  // Category and discovery
  CATEGORY_VIEW: 'category_view',
  DISCOVERY_VIEW: 'discovery_view',
  SEARCH_QUERY: 'search_query',
  
  // User engagement
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  CONTACT_FORM: 'contact_form',
  SOCIAL_SHARE: 'social_share',
  
  // Performance metrics
  PAGE_LOAD_TIME: 'page_load_time',
  IMAGE_LOAD_TIME: 'image_load_time',
  API_RESPONSE_TIME: 'api_response_time',
  
  // Monetization events
  AD_VIEW: 'ad_view',
  AD_CLICK: 'ad_click',
  AFFILIATE_CLICK: 'affiliate_click',
  REVENUE_EVENT: 'revenue_event'
} as const

// Development/Production Environment
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
