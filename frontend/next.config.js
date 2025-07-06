module.exports = {
    images: {
      domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*', // Forward to your Express server
        },
      ];
    },
  }
  