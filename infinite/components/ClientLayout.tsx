"use client"

import type React from "react"
import Link from "next/link"

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <a href="#main-content" className="skip-link">Preskočiť na hlavný obsah</a>
      <header role="banner" style={{ position: "sticky", top: 0, zIndex: 50, padding: "1rem 0", backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "saturate(120%) blur(6px)", borderBottom: "1px solid #111" }}>
        <div className="container" style={{ margin: "0 auto", padding: "0 1rem", maxWidth: "1200px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }} aria-label="Infinite - Domovská stránka">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    letterSpacing: "-0.025em",
                    margin: 0,
                    color: "#eaeaea",
                  }}
                >
                  infinite
                </h1>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.125rem", margin: "0.125rem 0 0 0" }}>
                  nekonečné objavy, každý deň
                </p>
              </div>
            </Link>

            <nav role="navigation" aria-label="Hlavná navigácia">
              <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0, gap: "2rem" }}>
                <li>
                  <Link
                    href="/"
                    style={{
                      textDecoration: "none",
                      color: "#eaeaea",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      transition: "all 0.2s ease",
                      border: "1px solid #222",
                      backgroundColor: "transparent"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#0b0b0b"
                      e.currentTarget.style.borderColor = "#333"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.borderColor = "#222"
                    }}
                    aria-current="page"
                  >
                    NASA fotka dňa
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" style={{ flex: 1 }}>{children}</main>

      <footer role="contentinfo" style={{ borderTop: "1px solid #1f1f1f", padding: "2rem 0", marginTop: "4rem" }}>
        <div
          className="container"
          style={{
            margin: "0 auto",
            padding: "0 1rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#9ca3af",
          }}
        >
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Infinite — Nekonečné objavy, každý deň.</p>
          <p style={{ marginTop: "0.25rem", margin: "0.25rem 0 0 0" }}>
            Zdroj dát:{" "}
            <a href="https://apod.nasa.gov/" style={{ textDecoration: "underline", color: "#9ca3af" }}>
              NASA APOD
            </a>
          </p>
              <div style={{ marginTop: "0.5rem", display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => (window as any)?.openConsent?.()}
                  className="btn-secondary"
                  style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                  aria-label="Zmeniť nastavenia súhlasu pre cookies a analýzu"
                >
                  Zmeniť nastavenia súhlasu
                </button>
              </div>
        </div>
      </footer>
    </div>
  )
}
