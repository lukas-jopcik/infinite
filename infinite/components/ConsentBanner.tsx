"use client"
import { useEffect, useState } from "react"

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ga_consent_v1")
      if (!saved) setVisible(true)
    } catch {
      setVisible(true)
    }
    // expose helper to reopen banner from anywhere (e.g., footer link)
    try {
      ;(window as any).openConsent = () => setVisible(true)
      ;(window as any).setConsent = (granted: boolean) => updateConsent(granted)
    } catch {}
  }, [])

  const updateConsent = (granted: boolean) => {
    try {
      localStorage.setItem("ga_consent_v1", granted ? "granted" : "denied")
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: granted ? 'granted' : 'denied',
          ad_user_data: granted ? 'granted' : 'denied',
          ad_personalization: granted ? 'granted' : 'denied',
          analytics_storage: granted ? 'granted' : 'denied',
        })
      }
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 60,
        background: 'rgba(0,0,0,0.9)',
        color: '#eaeaea',
        borderRadius: 12,
        padding: '14px 16px',
        backdropFilter: 'blur(6px)'
      }}
   >
      <p style={{ margin: 0, marginBottom: 10, lineHeight: 1.5 }}>
        Používame súbory cookie na analytiku (Google Analytics). Môžeš zmeniť rozhodnutie kedykoľvek v pätičke.
      </p>
      <ul style={{
        margin: 0,
        paddingLeft: 18,
        color: '#b3b3b3',
        lineHeight: 1.4,
        marginBottom: 12
      }}>
        <li>bez reklamných cookies</li>
        <li>iba agregované štatistiky návštevnosti</li>
      </ul>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={() => updateConsent(false)}>Odmietnuť</button>
        <button className="btn-primary" onClick={() => updateConsent(true)}>Povoliť analytiku</button>
      </div>
    </div>
  )
}


