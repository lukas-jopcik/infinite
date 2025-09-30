export type AnalyticsParams = {
  category?: string
  label?: string
  value?: number
  [key: string]: any
}

export function trackEvent(action: string, params: AnalyticsParams = {}) {
  try {
    if (typeof window === 'undefined') return
    // @ts-ignore
    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-WV1LXLMTJ6'
    if (!gtag || !GA_ID) return
    gtag('event', action, {
      event_category: params.category || 'interaction',
      event_label: params.label,
      value: params.value,
      ...params,
    })
  } catch {}
}


