#!/bin/bash
set -e

echo "🚀 Starting deployment for EC2 t3.micro (1GB RAM)..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# 워크스페이스 루트 문제 해결을 위한 환경변수 설정
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

echo -e "${YELLOW}📦 Installing ALL dependencies (including dev for build & seed)...${NC}"
npm ci  # NODE_ENV=production 제거 - dev dependencies 포함

echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}🗄️ Applying database schema...${NC}"
npx prisma db push

echo -e "${YELLOW}🌱 Seeding initial data...${NC}"
npm run prisma:seed

echo -e "${YELLOW}🏗️ Building application (with memory limit: 1024MB)...${NC}"
NODE_OPTIONS="--max-old-space-size=1024" NEXT_TELEMETRY_DISABLED=1 npm run build

echo -e "${YELLOW}🧹 Removing dev dependencies to save space...${NC}"
npm prune --production

echo -e "${YELLOW}📊 Checking memory usage...${NC}"
free -h

# PM2가 이미 실행 중인지 확인
if pm2 list | grep -q "damipapa-blog"; then
  echo -e "${YELLOW}♻️ Restarting PM2...${NC}"
  pm2 restart ecosystem.config.js
else
  echo -e "${YELLOW}🚀 Starting PM2...${NC}"
  pm2 start ecosystem.config.js
  pm2 save
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 Monitoring commands:"
echo "  - pm2 monit           # Real-time monitoring"
echo "  - pm2 logs            # View logs"
echo "  - free -h             # Check memory usage"
echo ""

