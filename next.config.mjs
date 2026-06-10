/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  async rewrites() {
    const marketingHosts = ['glowdeskapp.online', 'www.glowdeskapp.online']
    return marketingHosts.flatMap(host => [
      {
        source: '/',
        destination: '/_site',
        has: [{ type: 'host', value: host }],
      },
      {
        source: '/:path+',
        destination: '/_site/:path+',
        has: [{ type: 'host', value: host }],
      },
    ])
  },
}

export default nextConfig
