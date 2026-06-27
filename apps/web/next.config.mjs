/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@qmcover/shared"],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      canvas: false
    };
    return config;
  }
};

export default nextConfig;
