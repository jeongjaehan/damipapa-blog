#!/bin/bash
set -e

echo "🚀 Starting local deployment..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# .env 파일 확인
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  echo "Warning: .env file not found."
  echo "Please create .env file from env.example:"
  echo "  cp env.example .env"
  echo "  # Then edit .env with your actual values"
  exit 1
fi

export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production
export DEPLOY_ENV=local

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}🗄️ Applying database schema...${NC}"
npx prisma db push

echo -e "${YELLOW}🌱 Seeding initial data...${NC}"
npm run prisma:seed

echo -e "${YELLOW}🏗️ Building application (no memory limit)...${NC}"
npm run build:local

echo -e "${GREEN}✅ Local deployment complete!${NC}"
echo ""
echo "🚀 Start the application with:"
echo "  npm start                          # 직접 실행"
echo "  pm2 start ecosystem.local.config.js  # PM2로 실행 (클러스터 모드)"
echo ""

