export type Apod = {
  date: string // 'YYYY-MM-DD'
  title: string
  explanation: string
  url: string // image or video url
  hdurl?: string
  media_type: "image" | "video"
  copyright?: string
  headlineEN?: string // English version of the curiosity-driven headline
}

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY"
const BASE_URL = "https://api.nasa.gov/planetary/apod"

if (NASA_API_KEY === "DEMO_KEY") {
  console.warn("Using NASA DEMO_KEY. Set NASA_API_KEY environment variable for production.")
}

async function fetchApod(params: string): Promise<Apod | Apod[]> {
  const url = `${BASE_URL}?api_key=${NASA_API_KEY}&${params}`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // 1 hour
  })

  if (!response.ok) {
    throw new Error(`NASA API error: ${response.status}`)
  }

  return response.json()
}

export async function getApodLatest(): Promise<Apod> {
  const data = await fetchApod("")
  return Array.isArray(data) ? data[0] : data
}

export async function getApodByDate(date: string): Promise<Apod> {
  const data = await fetchApod(`date=${date}`)
  return Array.isArray(data) ? data[0] : data
}

export async function getApodRange({ start, end }: { start: string; end: string }): Promise<Apod[]> {
  const data = await fetchApod(`start_date=${start}&end_date=${end}`)
  return Array.isArray(data) ? data : [data]
}
