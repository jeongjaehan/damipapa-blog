# 🔒 보안 패치 요약 (Security Patch Summary)

**날짜**: 2025-12-27  
**심각도**: 🔴 Critical  
**이슈**: xmrig 크립토마이닝 공격 대응

---

## 📋 발견된 취약점

### 1. Path Traversal 취약점 (Critical ⚠️)
**파일**: `app/api/files/[filename]/route.ts`

**문제점**:
- 파일명에 대한 검증 없이 `join(UPLOAD_DIR, filename)` 사용
- 공격자가 `../../../../../../tmp/xmrig` 같은 경로로 악성 파일 저장/읽기 가능

**영향**:
- 시스템 전체 파일 접근 가능
- 악성 실행 파일 업로드 가능
- 크립토마이닝 바이너리 설치 가능

### 2. 파일 업로드 검증 불충분 (High ⚠️)
**파일**: `app/api/files/upload/route.ts`

**문제점**:
- MIME type만 검증 (클라이언트에서 조작 가능)
- 파일 내용(매직 바이트) 검증 없음
- 확장자만 체크

**영향**:
- 악성 파일을 이미지로 위장하여 업로드 가능
- 실행 파일 업로드 가능

### 3. JWT Secret 기본값 사용 (Critical ⚠️)
**파일**: `lib/auth.ts`

**문제점**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'
```

**영향**:
- 환경변수 미설정 시 예측 가능한 기본값 사용
- 공격자가 관리자 토큰 생성 가능
- 전체 시스템 장악 가능

### 4. npm 의존성 취약점 (Critical ⚠️)
- Next.js RCE 취약점 (CVE)
- jws HMAC 서명 검증 취약점
- glob 명령 주입 취약점

---

## ✅ 적용된 보안 패치

### 1. Path Traversal 방지
**파일**: `app/api/files/[filename]/route.ts`, `lib/security.ts`

**변경사항**:
```typescript
// 🔒 파일명 검증
if (!isValidFilename(filename)) {
  return new NextResponse('Invalid filename', { status: 400 })
}

// 🔒 UUID 패턴 강제
if (!isValidUUIDFilename(filename)) {
  return new NextResponse('Invalid filename format', { status: 400 })
}
```

**효과**:
- 경로 구분자(`/`, `\`, `..`) 차단
- UUID 패턴만 허용
- NULL 바이트 및 제어 문자 차단

### 2. 파일 업로드 보안 강화
**파일**: `app/api/files/upload/route.ts`, `lib/security.ts`

**변경사항**:
```typescript
// 🔒 파일 매직 바이트 검증
export function verifyImageSignature(buffer: Buffer, extension: string): boolean {
  // JPEG: FF D8 FF
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  // GIF: 47 49 46 38
  // WebP: 52 49 46 46 ... 57 45 42 50
}
```

**효과**:
- 실제 파일 내용(헤더) 검증
- 위장된 악성 파일 차단
- 이미지 파일만 업로드 허용

### 3. JWT Secret 보안 강화
**파일**: `lib/auth.ts`

**변경사항**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || ''
if (!JWT_SECRET || JWT_SECRET === 'default-secret-key' || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is not properly configured')
}
```

**효과**:
- 환경변수 필수 설정
- 최소 32자 이상 요구
- 기본값 사용 시 서버 시작 실패

### 4. 보안 미들웨어 추가
**파일**: `middleware.ts`

**변경사항**:
```typescript
// 보안 헤더 추가
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-XSS-Protection', '1; mode=block')

// 위험한 파일 차단
const dangerousExtensions = ['.sh', '.php', '.py', '.exe', ...]
```

**효과**:
- XSS, Clickjacking 방지
- 실행 파일 다운로드 차단
- Content-Type 스니핑 방지

### 5. npm 의존성 업데이트
**명령어**: `npm audit fix`

**결과**:
```
Before: 4 vulnerabilities (1 moderate, 2 high, 1 critical)
After:  0 vulnerabilities ✅
```

### 6. 보안 유틸리티 라이브러리
**파일**: `lib/security.ts`

**추가된 기능**:
- `isValidFilename()`: 파일명 검증
- `isValidUUIDFilename()`: UUID 패턴 검증
- `verifyImageSignature()`: 매직 바이트 검증
- `containsSQLInjection()`: SQL Injection 탐지
- `containsXSS()`: XSS 패턴 탐지
- `sanitizeInput()`: 입력값 정제

### 7. 보안 점검 스크립트
**파일**: `scripts/security-check.sh`

**기능**:
- xmrig/minerd 프로세스 탐지
- 의심스러운 파일 검색
- 높은 CPU 사용률 프로세스 확인
- 마이닝 포트 연결 확인
- Cron job 점검
- JWT_SECRET 검증
- 파일 권한 확인
- npm 취약점 확인

---

## 🚨 즉시 조치 사항

### 1. JWT_SECRET 설정 (필수!)

```bash
# 안전한 랜덤 문자열 생성
openssl rand -base64 64

# .env 파일에 추가
echo "JWT_SECRET=생성된_문자열" >> .env
```

### 2. xmrig 제거

```bash
# 프로세스 종료
ps aux | grep xmrig
sudo pkill -9 xmrig

# 파일 삭제
sudo find / -name "*xmrig*" -type f -delete 2>/dev/null
sudo find / -name "*minerd*" -type f -delete 2>/dev/null

# Cron job 확인 및 제거
crontab -l
crontab -e  # 의심스러운 항목 삭제
```

### 3. 파일 시스템 권한 설정

```bash
# 업로드 디렉토리 실행 권한 제거
find public/uploads -type f -exec chmod 644 {} \;

# 의심스러운 파일 삭제
find public/uploads -type f ! -name "*.jpg" ! -name "*.jpeg" ! -name "*.png" ! -name "*.gif" ! -name "*.webp" -delete
```

### 4. 방화벽 설정

```bash
# 마이닝 포트 차단
sudo iptables -A OUTPUT -p tcp --dport 3333 -j DROP
sudo iptables -A OUTPUT -p tcp --dport 4444 -j DROP
sudo iptables -A OUTPUT -p tcp --dport 5555 -j DROP
sudo iptables -A OUTPUT -p tcp --dport 14444 -j DROP

# 설정 저장
sudo iptables-save > /etc/iptables/rules.v4
```

### 5. 로그 확인

```bash
# 시스템 로그
sudo tail -f /var/log/syslog | grep -iE "(xmrig|minerd|crypto)"

# Nginx 로그
sudo tail -f /var/log/nginx/access.log | grep -E "\.sh|\.php|\.exe"
```

---

## 📊 보안 점검 결과

### 현재 상태 (2025-12-27)

✅ **Path Traversal 방지**: 구현됨  
✅ **파일 업로드 보안**: 매직 바이트 검증 추가  
✅ **JWT Secret**: 강제 설정 (75자)  
✅ **npm 취약점**: 0개  
✅ **보안 헤더**: 적용됨  
✅ **실행 파일 차단**: 구현됨  

⚠️ **추가 권장사항**:
- Rate Limiting 구현
- WAF (Web Application Firewall) 적용
- 정기 보안 감사
- 침입 탐지 시스템 (IDS) 설치

---

## 🔄 정기 점검 스케줄

### 일일 점검
```bash
# Cron 등록
crontab -e

# 매일 오전 3시 실행
0 3 * * * /path/to/damipapa-blog/scripts/security-check.sh >> /var/log/security-check.log 2>&1
```

### 주간 점검
- npm 의존성 업데이트
- 시스템 패치 적용
- 로그 분석

### 월간 점검
- 전체 보안 감사
- 침투 테스트
- 백업 검증

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Path Traversal Attack](https://owasp.org/www-community/attacks/Path_Traversal)
- [File Upload Security](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] JWT_SECRET 환경변수 설정 (64자 이상)
- [ ] xmrig 프로세스 및 파일 제거 완료
- [ ] 파일 업로드 디렉토리 권한 설정 (755, 실행 권한 없음)
- [ ] 방화벽 규칙 적용
- [ ] npm audit 0 vulnerabilities 확인
- [ ] 보안 점검 스크립트 실행 및 이상 없음 확인
- [ ] Cron job에 의심스러운 항목 없음
- [ ] 시스템 로그 확인
- [ ] .env 파일이 .gitignore에 포함되어 있음
- [ ] 정기 보안 점검 일정 수립

---

**문의**: 보안 이슈 발견 시 즉시 시스템 관리자에게 보고하세요.

