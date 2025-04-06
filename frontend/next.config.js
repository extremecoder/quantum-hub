/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'quantum-hub-secret-key',
  },
  reactStrictMode: true,
}

module.exports = nextConfig
