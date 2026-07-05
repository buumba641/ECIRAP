/** @type {import('next').NextConfig} */
import path from "path"

const projectRoot = path.resolve()

const nextConfig = {
  outputFileTracingRoot: projectRoot,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
