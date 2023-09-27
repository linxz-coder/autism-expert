const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://8.218.72.177:5328/api/:path*'
            : '/api/',
      },
    ]
  },
}

module.exports = nextConfig

