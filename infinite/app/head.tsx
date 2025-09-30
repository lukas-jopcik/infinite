export default function Head() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod'
  const s3Host = 'infinite-nasa-apod-dev-images-349660737637.s3.eu-central-1.amazonaws.com'
  return (
    <>
      <link rel="preconnect" href={apiBase} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={apiBase} />
      <link rel="preconnect" href={`https://${s3Host}`} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={`https://${s3Host}`} />
    </>
  )
}


