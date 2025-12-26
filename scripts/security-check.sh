#!/bin/bash

# 🔒 보안 점검 스크립트
# xmrig 및 기타 악성 프로세스 탐지

echo "🔍 보안 점검 시작..."
echo ""

# 1. 의심스러운 프로세스 확인
echo "1️⃣ 의심스러운 프로세스 확인..."
SUSPICIOUS_PROCS=$(ps aux | grep -iE "(xmrig|minerd|crypto|coinhive)" | grep -v grep)
if [ -n "$SUSPICIOUS_PROCS" ]; then
    echo "⚠️  경고: 의심스러운 프로세스 발견!"
    echo "$SUSPICIOUS_PROCS"
else
    echo "✅ 의심스러운 프로세스 없음"
fi
echo ""

# 2. 의심스러운 파일 검색
echo "2️⃣ 의심스러운 파일 검색..."
SUSPICIOUS_FILES=$(find /tmp /var/tmp ~/.cache -type f -name "*xmrig*" -o -name "*minerd*" 2>/dev/null)
if [ -n "$SUSPICIOUS_FILES" ]; then
    echo "⚠️  경고: 의심스러운 파일 발견!"
    echo "$SUSPICIOUS_FILES"
else
    echo "✅ 의심스러운 파일 없음"
fi
echo ""

# 3. 높은 CPU 사용률 프로세스 확인
echo "3️⃣ 높은 CPU 사용률 프로세스 (상위 5개)..."
ps aux --sort=-%cpu | head -6
echo ""

# 4. 의심스러운 네트워크 연결 확인
echo "4️⃣ 의심스러운 네트워크 연결 확인..."
SUSPICIOUS_PORTS=$(netstat -tunlp 2>/dev/null | grep -E ":(3333|4444|5555|14444)" || ss -tunlp 2>/dev/null | grep -E ":(3333|4444|5555|14444)")
if [ -n "$SUSPICIOUS_PORTS" ]; then
    echo "⚠️  경고: 마이닝 포트 연결 발견!"
    echo "$SUSPICIOUS_PORTS"
else
    echo "✅ 의심스러운 포트 연결 없음"
fi
echo ""

# 5. Cron job 확인
echo "5️⃣ Cron job 확인..."
echo "사용자 crontab:"
crontab -l 2>/dev/null || echo "  (없음)"
echo ""
echo "시스템 crontab:"
cat /etc/crontab 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (없음)"
echo ""

# 6. 최근 수정된 스크립트 파일 확인
echo "6️⃣ 최근 24시간 내 수정된 스크립트 파일..."
find /tmp /var/tmp ~/.cache -type f \( -name "*.sh" -o -name "*.py" -o -name "*.pl" \) -mtime -1 2>/dev/null | head -10
echo ""

# 7. JWT_SECRET 환경변수 확인
echo "7️⃣ JWT_SECRET 환경변수 확인..."
if [ -f .env ]; then
    if grep -q "JWT_SECRET=" .env; then
        JWT_SECRET_VALUE=$(grep "JWT_SECRET=" .env | cut -d'=' -f2)
        JWT_SECRET_LENGTH=${#JWT_SECRET_VALUE}
        
        if [ $JWT_SECRET_LENGTH -lt 32 ]; then
            echo "⚠️  경고: JWT_SECRET이 너무 짧습니다 (현재: ${JWT_SECRET_LENGTH}자, 최소: 32자)"
        elif [ "$JWT_SECRET_VALUE" = "default-secret-key" ]; then
            echo "❌ 위험: JWT_SECRET이 기본값입니다!"
        else
            echo "✅ JWT_SECRET 설정됨 (${JWT_SECRET_LENGTH}자)"
        fi
    else
        echo "❌ 위험: JWT_SECRET이 설정되지 않았습니다!"
    fi
else
    echo "⚠️  경고: .env 파일이 없습니다"
fi
echo ""

# 8. 파일 업로드 디렉토리 권한 확인
echo "8️⃣ 파일 업로드 디렉토리 권한 확인..."
if [ -d "public/uploads" ]; then
    UPLOAD_PERMS=$(stat -c "%a" public/uploads 2>/dev/null || stat -f "%Lp" public/uploads)
    echo "  public/uploads 권한: $UPLOAD_PERMS"
    
    EXEC_FILES=$(find public/uploads -type f -executable 2>/dev/null)
    if [ -n "$EXEC_FILES" ]; then
        echo "⚠️  경고: 실행 가능한 파일 발견!"
        echo "$EXEC_FILES"
    else
        echo "✅ 실행 가능한 파일 없음"
    fi
else
    echo "  public/uploads 디렉토리 없음"
fi
echo ""

# 9. npm 보안 취약점 확인
echo "9️⃣ npm 보안 취약점 확인..."
npm audit --production 2>&1 | head -20
echo ""

echo "🔍 보안 점검 완료!"
echo ""
echo "💡 권장 사항:"
echo "  - 의심스러운 항목이 발견되면 즉시 조치하세요"
echo "  - 정기적으로 이 스크립트를 실행하세요 (cron 등록 권장)"
echo "  - 서버 로그를 정기적으로 모니터링하세요"

