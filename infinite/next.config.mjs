const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'apod.nasa.gov',
      'www.youtube.com',
      'img.youtube.com',
      'i.vimeocdn.com',
      'infinite-nasa-apod-dev-images-349660737637.s3.eu-central-1.amazonaws.com'
    ],
    unoptimized: true,
  },
}

export default nextConfig
