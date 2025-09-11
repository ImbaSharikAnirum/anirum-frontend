/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdna.artstation.com',
        port: '',
        pathname: '/p/assets/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnb.artstation.com',
        port: '',
        pathname: '/p/assets/images/**',
      },
      {
        protocol: 'https',
        hostname: 'anirum.s3.eu-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anirum.up.railway.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
