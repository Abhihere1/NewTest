import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],
  images: {
    remotePatterns: [],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
