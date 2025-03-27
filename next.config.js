// @ts-check
 
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
}
 
export default nextConfig