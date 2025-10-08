import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Infinite Admin',
  description: 'Analytics dashboard for Infinite astronomy platform',
  robots: 'noindex, nofollow'
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Prehľad výkonnosti a návštevnosti stránky
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Posledné aktualizácie: {new Date().toLocaleString('sk-SK')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
