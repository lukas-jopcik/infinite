import { NextRequest } from "next/server"
import { ImageResponse } from "next/og"
// Ensure JSX is allowed by using .tsx extension in filename

export const runtime = "edge"

const width = 1200
const height = 630

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod"
}

export async function GET(req: NextRequest, { params }: { params: { date: string } }) {
  const date = params?.date
  try {
    const res = await fetch(`${apiBase()}/api/latest?date=${encodeURIComponent(date)}`, { cache: "no-store" })
    const json = await res.json().catch(() => ({ items: [] }))
    const item = Array.isArray(json.items) && json.items.length ? json.items[0] : null
    const title = item?.titleSk || item?.originalTitle || "NASA APOD"
    const img = item?.cachedImageUrl || item?.hdImageUrl || item?.imageUrl || undefined

    return new ImageResponse(
      (
        <div
          style={{
            width,
            height,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "relative",
            padding: 48,
            color: "white",
            background: "#000",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          }}
        >
          {img ? (
            <img
              src={img}
              alt=""
              width={width}
              height={height}
              style={{ position: "absolute", inset: 0, objectFit: "cover", filter: "brightness(0.75)" }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
            <div style={{ fontSize: 28, opacity: 0.9 }}>APOD • {date}</div>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <div style={{ fontSize: 24, opacity: 0.9 }}>Infinite — Nekonečné objavy, každý deň</div>
              <div
                style={{
                  fontSize: 20,
                  padding: "8px 14px",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                AI generované
              </div>
            </div>
          </div>
        </div>
      ),
      { width, height }
    )
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "black",
            color: "white",
            fontSize: 48,
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          }}
        >
          Infinite — APOD
        </div>
      ),
      { width, height }
    )
  }
}


