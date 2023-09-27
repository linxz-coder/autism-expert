const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://8.218.72.177:5328/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
