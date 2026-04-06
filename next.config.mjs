/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.yelpcdn.com",
      },
    ],
  },
};

export default nextConfig;
