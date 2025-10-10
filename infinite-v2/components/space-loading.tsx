"use client"

import { useEffect, useState } from "react"

export function SpaceLoading() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-8">
        {/* Space Animation Container */}
        <div className="relative h-32 w-32">
          {/* Central Star */}
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2">
            <div className="h-full w-full rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
          </div>
          
          {/* Orbiting Planet 1 */}
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2">
              <div className="h-full w-full rounded-full bg-blue-400 animate-spin" 
                   style={{ animationDuration: '3s' }} />
            </div>
          </div>
          
          {/* Orbiting Planet 2 */}
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2">
              <div className="h-full w-full rounded-full bg-purple-400 animate-spin" 
                   style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            </div>
          </div>
          
          {/* Orbiting Star */}
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute top-0 left-1/2 h-1 w-1 -translate-x-1/2">
              <div className="h-full w-full rounded-full bg-yellow-300 animate-spin" 
                   style={{ animationDuration: '4s' }} />
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Infinite
          </h1>
          <p className="text-muted-foreground text-sm">
            Načítavam vesmír{dots}
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse" 
               style={{ 
                 background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
                 transform: 'translateX(-100%)',
                 animation: 'loading-slide 2s ease-in-out infinite'
               }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export function SpaceLoadingInline() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        {/* Smaller Space Animation */}
        <div className="relative h-16 w-16">
          {/* Central Star */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-full w-full rounded-full bg-primary animate-pulse" />
          </div>
          
          {/* Orbiting Element */}
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2">
              <div className="h-full w-full rounded-full bg-blue-400 animate-spin" 
                   style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">Načítavam{dots}</p>
      </div>
    </div>
  )
}
