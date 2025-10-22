/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  
  // 정적 파일 서빙 설정
  trailingSlash: false,
  assetPrefix: '',
  
  // 웹팩 설정으로 경로 별칭 해결
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
  
  // 메모리 최적화
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  
  // 프로덕션 소스맵 비활성화 (메모리 절약)
  productionBrowserSourceMaps: false,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  
  // 이미지 최적화 제한 (메모리 절약)
  images: {
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    unoptimized: true, // 로컬 이미지 최적화 비활성화
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/files/**',
      },
    ],
  },
};

module.exports = nextConfig;

