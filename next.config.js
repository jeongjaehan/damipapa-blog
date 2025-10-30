/** @type {import('next').NextConfig} */
const path = require('path')

// 환경 감지: EC2 프로덕션 환경인지 확인
const isProduction = process.env.DEPLOY_ENV === 'production'

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
      '@': path.resolve(__dirname),
    }
    return config
  },
  
  // 환경별 메모리 최적화 (workerThreads는 webpack과 호환 안됨)
  experimental: {
    workerThreads: false,
    cpus: isProduction ? 1 : undefined,  // 로컬: CPU 제한 없음
  },
  
  // 프로덕션 소스맵 비활성화 (메모리 절약)
  productionBrowserSourceMaps: false,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },
  
  // 환경별 이미지 최적화 설정
  images: {
    minimumCacheTTL: 60,
    deviceSizes: isProduction 
      ? [640, 750, 828, 1080]  // EC2: 제한된 사이즈
      : [640, 750, 828, 1080, 1200, 1920, 2048],  // 로컬: 더 큰 사이즈 지원
    imageSizes: isProduction
      ? [16, 32, 48, 64, 96, 128, 256]  // EC2: 제한된 사이즈
      : [16, 32, 48, 64, 96, 128, 256, 384],  // 로컬: 더 큰 사이즈
    formats: ['image/webp'],
    unoptimized: isProduction,  // EC2: 최적화 비활성화, 로컬: 활성화
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
