export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("sk-SK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getDateRange(days: number, fromDate?: string): { start: string; end: string } {
  const endDate = fromDate ? new Date(fromDate) : new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days + 1)

  return {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  }
}

export function subtractDays(dateString: string, days: number): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - days)
  return date.toISOString().split("T")[0]
}
