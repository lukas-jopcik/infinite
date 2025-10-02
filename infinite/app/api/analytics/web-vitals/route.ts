import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()
    
    // Log the metric (in production, you might want to send this to a monitoring service)
    console.log('Web Vital received:', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
    })

    // Here you could send the data to:
    // - Google Analytics 4
    // - Custom analytics service
    // - Database for analysis
    // - Monitoring service like DataDog, New Relic, etc.

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing web vital:', error)
    return NextResponse.json({ error: 'Failed to process web vital' }, { status: 500 })
  }
}
