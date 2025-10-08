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
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "1rem 0" }}>
        <div className="container" style={{ margin: "0 auto", padding: "0 1rem", maxWidth: "1200px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
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

            <nav>
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
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1f1f1f"
                      e.currentTarget.style.borderColor = "#374151"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.borderColor = "transparent"
                    }}
                  >
                    NASA fotka dňa
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "2rem 0", marginTop: "4rem" }}>
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
        </div>
      </footer>
    </div>
  )
}
