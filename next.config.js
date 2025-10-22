/** @type {import('next').NextConfig} */

// 포트 감지 로직
const getPort = () => {
  // 환경 변수에서 포트 가져오기
  const envPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT
  if (envPort) return envPort
  
  // 기본 포트는 3000
  return '3000'
}

const port = getPort()
const baseUrl = `http://localhost:${port}`

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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || `${baseUrl}/api`,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || baseUrl,
    NEXT_PUBLIC_PORT: port,
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
        port: port,
        pathname: '/api/files/**',
      },
    ],
  },
};

module.exports = nextConfig;

