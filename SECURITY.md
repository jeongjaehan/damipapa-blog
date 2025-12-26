# 🔒 보안 가이드 (Security Guide)

## ⚠️ xmrig 크립토마이닝 공격 대응

이 문서는 xmrig 등 악성 크립토마이닝 공격을 방어하기 위한 보안 조치를 설명합니다.

## 적용된 보안 패치

### 1. Path Traversal 공격 방지 ✅
**파일**: `app/api/files/[filename]/route.ts`

**취약점**: 파일명 검증 없이 임의 경로 접근 가능  
**해결**: 
- 경로 구분자(`/`, `\`, `..`) 차단
- UUID 패턴 검증
- 허용된 확장자만 허용

```typescript
// 공격 예시 (차단됨):
// GET /api/files/../../../../../../tmp/xmrig
// GET /api/files/../../../etc/passwd
```

### 2. 파일 업로드 보안 강화 ✅
**파일**: `app/api/files/upload/route.ts`

**취약점**: MIME type만 검증하여 악성 파일 업로드 가능  
**해결**:
- 파일 매직 바이트(File Signature) 검증
- 확장자 화이트리스트 적용
- UUID 기반 파일명 사용

```typescript
// 실제 파일 내용(헤더)을 검증하여 이미지 파일만 허용
function verifyFileSignature(buffer: Buffer, filename: string): boolean
```

### 3. JWT Secret 보안 강화 ✅
**파일**: `lib/auth.ts`

**취약점**: 기본값 사용 시 공격자가 관리자 토큰 생성 가능  
**해결**:
- 환경변수 필수 설정
- 최소 32자 이상 요구
- 기본값 사용 시 서버 시작 실패

## 필수 조치 사항

### 1. 환경변수 설정 (즉시 적용 필요!)

**강력한 JWT Secret 생성:**
```bash
# 안전한 랜덤 문자열 생성 (64자)
openssl rand -base64 64

# 또는 
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**.env 파일에 추가:**
```env
JWT_SECRET=여기에_생성된_64자_이상의_랜덤_문자열_입력
DATABASE_URL=your_database_url
```

### 2. 서버 점검

**xmrig 프로세스 확인 및 제거:**
```bash
# 실행 중인 xmrig 프로세스 찾기
ps aux | grep xmrig
ps aux | grep minerd
ps aux | grep crypto

# 의심스러운 프로세스 종료
kill -9 <PID>

# xmrig 파일 찾기 및 삭제
sudo find / -name "*xmrig*" -type f 2>/dev/null
sudo find / -name "*minerd*" -type f 2>/dev/null

# 임시 디렉토리 점검
ls -la /tmp/
ls -la /var/tmp/
ls -la ~/.cache/

# cron job 확인
crontab -l
sudo cat /etc/crontab
ls -la /etc/cron.d/
```

### 3. 파일 시스템 권한 설정

```bash
# 업로드 디렉토리 권한 제한
chmod 755 public/uploads
chown www-data:www-data public/uploads  # 또는 적절한 사용자

# 실행 권한 제거
find public/uploads -type f -exec chmod 644 {} \;
```

### 4. Nginx/Apache 설정 (해당하는 경우)

**Nginx에서 업로드 디렉토리 실행 방지:**
```nginx
location /uploads/ {
    # 스크립트 실행 방지
    location ~ \.(php|pl|py|jsp|asp|sh|cgi)$ {
        deny all;
    }
}
```

### 5. Docker 보안 (사용 중인 경우)

**docker-compose.yml 보안 강화:**
```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    volumes:
      - ./uploads:/app/public/uploads:noexec,nosuid
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## 추가 보안 권장사항

### 1. Rate Limiting
파일 업로드 API에 속도 제한 적용:
```typescript
// 예시: express-rate-limit 사용
import rateLimit from 'express-rate-limit'

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10 // 최대 10번
})
```

### 2. 로그 모니터링
```bash
# 의심스러운 활동 모니터링
tail -f /var/log/nginx/access.log | grep -E "(xmrig|minerd|crypto|\.sh|\.php)"
tail -f /var/log/nginx/error.log
```

### 3. 방화벽 설정
```bash
# 아웃바운드 마이닝 포트 차단
sudo iptables -A OUTPUT -p tcp --dport 3333 -j DROP  # Stratum
sudo iptables -A OUTPUT -p tcp --dport 4444 -j DROP  # Stratum
sudo iptables -A OUTPUT -p tcp --dport 5555 -j DROP  # Stratum
sudo iptables -A OUTPUT -p tcp --dport 14444 -j DROP # Monero
```

### 4. 시스템 모니터링
```bash
# CPU 사용률 모니터링
top -b -n 1 | head -n 20

# 네트워크 연결 확인
netstat -tunlp | grep ESTABLISHED

# 의심스러운 네트워크 활동
ss -tunlp
```

## 사고 발생 시 대응

1. **즉시 서버 격리**
   ```bash
   # 네트워크 차단
   sudo iptables -P INPUT DROP
   sudo iptables -P OUTPUT DROP
   ```

2. **악성 프로세스 종료**
   ```bash
   # 모든 xmrig 프로세스 종료
   sudo pkill -9 xmrig
   sudo pkill -9 minerd
   ```

3. **악성 파일 제거**
   ```bash
   # 최근 수정된 의심스러운 파일 찾기
   find / -type f -mtime -1 -name "*xmrig*" 2>/dev/null
   find / -type f -mtime -1 -name "*.sh" -path "*/tmp/*" 2>/dev/null
   ```

4. **시스템 재시작 및 보안 업데이트**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   sudo reboot
   ```

5. **로그 분석**
   - 침입 경로 파악
   - 피해 범위 확인
   - 재발 방지책 수립

## 체크리스트

- [ ] JWT_SECRET 환경변수 설정 (64자 이상)
- [ ] xmrig 프로세스 확인 및 제거
- [ ] 악성 파일 검색 및 삭제
- [ ] cron job 점검
- [ ] 파일 업로드 디렉토리 권한 설정
- [ ] 방화벽 규칙 적용
- [ ] Rate limiting 적용
- [ ] 로그 모니터링 설정
- [ ] 정기 보안 점검 일정 수립

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Path Traversal Attack](https://owasp.org/www-community/attacks/Path_Traversal)
- [File Upload Security](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)

## 문의

보안 이슈 발견 시 즉시 시스템 관리자에게 보고하세요.

