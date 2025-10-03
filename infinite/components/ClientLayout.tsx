"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const closeDropdowns = () => {
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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

            {/* Desktop Navigation - Only visible on desktop */}
            {!isMobile && (
              <nav 
                role="navigation" 
                aria-label="Hlavná navigácia"
                style={{ 
                  display: "flex" 
                }}
              >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
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
                    border: "1px solid #333",
                    backgroundColor: "transparent",
                    display: "block",
                    textTransform: "uppercase"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1a1a1a"
                    e.currentTarget.style.borderColor = "#555"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderColor = "#333"
                  }}
                >
                  Objav dňa
                </Link>
                
                <Link
                  href="/objav-tyzdna"
                  style={{
                    color: "#eaeaea",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    transition: "all 0.2s ease",
                    border: "1px solid #333",
                    backgroundColor: "transparent",
                    textDecoration: "none",
                    display: "block",
                    textTransform: "uppercase"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1a1a1a"
                    e.currentTarget.style.borderColor = "#555"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.borderColor = "#333"
                  }}
                >
                  Objav týždňa
                </Link>
                
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => handleDropdownToggle('categories')}
                    style={{
                      color: "#eaeaea",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      transition: "all 0.2s ease",
                      border: "1px solid #333",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      textTransform: "uppercase"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1a1a1a"
                      e.currentTarget.style.borderColor = "#555"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.borderColor = "#333"
                    }}
                  >
                    Kategórie
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 12 12" 
                      fill="none" 
                      style={{ 
                        transform: activeDropdown === 'categories' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {activeDropdown === 'categories' && (
                    <div 
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        marginTop: "0.5rem",
                        backgroundColor: "rgba(0,0,0,0.95)",
                        border: "1px solid #333",
                        borderRadius: "0.5rem",
                        padding: "0.5rem",
                        minWidth: "220px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        zIndex: 1000
                      }}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        href="/kategorie"
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem",
                          color: "#eaeaea",
                          textDecoration: "none",
                          borderRadius: "0.25rem",
                          transition: "background-color 0.2s ease",
                          fontSize: "0.875rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#1a1a1a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        onClick={closeDropdowns}
                      >
                        Všetky kategórie
                      </Link>
                      <Link
                        href="/kategorie/komety"
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem",
                          color: "#eaeaea",
                          textDecoration: "none",
                          borderRadius: "0.25rem",
                          transition: "background-color 0.2s ease",
                          fontSize: "0.875rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#1a1a1a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        onClick={closeDropdowns}
                      >
                        Kométy
                      </Link>
                      <Link
                        href="/kategorie/planety"
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem",
                          color: "#eaeaea",
                          textDecoration: "none",
                          borderRadius: "0.25rem",
                          transition: "background-color 0.2s ease",
                          fontSize: "0.875rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#1a1a1a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        onClick={closeDropdowns}
                      >
                        Planéty
                      </Link>
                      <Link
                        href="/kategorie/galaxie"
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem",
                          color: "#eaeaea",
                          textDecoration: "none",
                          borderRadius: "0.25rem",
                          transition: "background-color 0.2s ease",
                          fontSize: "0.875rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#1a1a1a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        onClick={closeDropdowns}
                      >
                        Galaxie
                      </Link>
                      <Link
                        href="/kategorie/hviezdy"
                        style={{
                          display: "block",
                          padding: "0.75rem 1rem",
                          color: "#eaeaea",
                          textDecoration: "none",
                          borderRadius: "0.25rem",
                          transition: "background-color 0.2s ease",
                          fontSize: "0.875rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#1a1a1a"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                        onClick={closeDropdowns}
                      >
                        Hviezdy
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </nav>
            )}

            {/* Mobile Menu Button - Only visible on mobile */}
            {isMobile && (
              <button
                onClick={toggleMobileMenu}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "0.375rem",
                  padding: "0.5rem",
                  color: "#eaeaea",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label="Otvoriť menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {isMobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div 
              className="md:hidden"
              style={{
                position: "absolute",
                top: "100%",
                left: "0",
                right: "0",
                backgroundColor: "rgba(0,0,0,0.95)",
                borderTop: "1px solid #333",
                padding: "1rem",
                margin: "0 1rem",
                borderRadius: "0 0 0.5rem 0.5rem"
              }}
            >
              <nav role="navigation" aria-label="Mobilná navigácia">
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Link
                      href="/"
                      style={{
                        display: "block",
                        padding: "0.75rem 1rem",
                        color: "#eaeaea",
                        textDecoration: "none",
                        borderRadius: "0.375rem",
                        border: "1px solid #333",
                        transition: "background-color 0.2s ease"
                      }}
                      onClick={closeDropdowns}
                    >
                      Objav dňa
                    </Link>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <Link
                      href="/objav-tyzdna"
                      style={{
                        display: "block",
                        padding: "0.75rem 1rem",
                        color: "#eaeaea",
                        textDecoration: "none",
                        borderRadius: "0.375rem",
                        border: "1px solid #333",
                        transition: "background-color 0.2s ease"
                      }}
                      onClick={closeDropdowns}
                    >
                      Objav týždňa
                    </Link>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <button
                      onClick={() => handleDropdownToggle('mobile-categories')}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        color: "#eaeaea",
                        backgroundColor: "transparent",
                        border: "1px solid #333",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left"
                      }}
                    >
                      Kategórie
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 12 12" 
                        fill="none"
                        style={{ 
                          transform: activeDropdown === 'mobile-categories' ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {activeDropdown === 'mobile-categories' && (
                      <div style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                        <Link
                          href="/kategorie"
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            color: "#eaeaea",
                            textDecoration: "none",
                            borderRadius: "0.25rem",
                            marginBottom: "0.25rem",
                            transition: "background-color 0.2s ease"
                          }}
                          onClick={closeDropdowns}
                        >
                          Všetky kategórie
                        </Link>
                        <Link
                          href="/kategorie/komety"
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            color: "#eaeaea",
                            textDecoration: "none",
                            borderRadius: "0.25rem",
                            marginBottom: "0.25rem",
                            transition: "background-color 0.2s ease"
                          }}
                          onClick={closeDropdowns}
                        >
                          Kométy
                        </Link>
                        <Link
                          href="/kategorie/planety"
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            color: "#eaeaea",
                            textDecoration: "none",
                            borderRadius: "0.25rem",
                            marginBottom: "0.25rem",
                            transition: "background-color 0.2s ease"
                          }}
                          onClick={closeDropdowns}
                        >
                          Planéty
                        </Link>
                        <Link
                          href="/kategorie/galaxie"
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            color: "#eaeaea",
                            textDecoration: "none",
                            borderRadius: "0.25rem",
                            marginBottom: "0.25rem",
                            transition: "background-color 0.2s ease"
                          }}
                          onClick={closeDropdowns}
                        >
                          Galaxie
                        </Link>
                        <Link
                          href="/kategorie/hviezdy"
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            color: "#eaeaea",
                            textDecoration: "none",
                            borderRadius: "0.25rem",
                            marginBottom: "0.25rem",
                            transition: "background-color 0.2s ease"
                          }}
                          onClick={closeDropdowns}
                        >
                          Hviezdy
                        </Link>
                      </div>
                    )}
                  </li>
                </ul>
              </nav>
            </div>
          )}
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
