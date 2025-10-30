#!/bin/bash
set -e

echo "⚡ Quick deployment (code changes only)..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# 환경변수 설정
export NEXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

echo -e "${YELLOW}🏗️ Building application (with memory limit: 1024MB)...${NC}"
NODE_OPTIONS="--max-old-space-size=1024" DEPLOY_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build:prod

# PM2가 이미 실행 중인지 확인
if pm2 list | grep -q "damipapa-blog"; then
  echo -e "${YELLOW}♻️ Restarting PM2...${NC}"
  pm2 restart ecosystem.production.config.js
else
  echo -e "${YELLOW}🚀 Starting PM2...${NC}"
  pm2 start ecosystem.production.config.js
  pm2 save
fi

echo -e "${GREEN}✅ Quick deployment complete!${NC}"
echo ""
echo -e "${YELLOW}ℹ️  This script only rebuilds and restarts the app.${NC}"
echo -e "${YELLOW}   If you changed package.json or schema.prisma, use ./deploy.sh instead${NC}"
echo ""
echo "📊 Monitoring commands:"
echo "  - pm2 monit           # Real-time monitoring"
echo "  - pm2 logs            # View logs"
echo ""

