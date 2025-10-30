# 전기차 보조금 도우미 앱

전국 지역별 전기차 보조금 지급 현황을 실시간으로 조회하는 모바일 애플리케이션입니다.

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![Build](https://img.shields.io/badge/build-16-green)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey)
![Flutter](https://img.shields.io/badge/Flutter-3.32.4-blue)

## 📱 프로젝트 개요

본 앱은 한국환경공단의 전기차 보조금 데이터를 실시간으로 수집하고, 사용자가 지역별/차종별로 보조금 정보를 쉽게 비교할 수 있도록 제공하는 서비스입니다.

### 주요 목적
- 전기차 구매를 고려하는 사용자에게 지역별 보조금 현황 제공
- 차량 모델별 최적 구매 지역 추천
- 보조금 신청/출고 현황의 실시간 모니터링

## 🏗️ 프로젝트 구조

```
.
├── EVSubsidy/              # Flutter 모바일 애플리케이션
│   ├── lib/
│   │   ├── models/         # 데이터 모델
│   │   ├── providers/      # 상태 관리 (Provider 패턴)
│   │   ├── screens/        # UI 화면
│   │   ├── services/       # API 및 비즈니스 로직
│   │   └── widgets/        # 재사용 가능한 위젯
│   ├── android/            # Android 네이티브 설정
│   ├── ios/                # iOS 네이티브 설정
│   └── assets/             # 앱 리소스 (아이콘 등)
│
└── ev-crawling/            # Node.js 백엔드 서버
    ├── routes/             # API 라우트
    ├── public/             # 정적 파일 (개인정보처리방침 등)
    ├── downloads/          # 크롤링 데이터 저장소
    └── server.js           # Express 서버
```

## 🛠️ 기술 스택

### 모바일 앱 (Flutter)

#### 핵심 프레임워크
- **Flutter**: 3.32.4 (크로스 플랫폼 UI 프레임워크)
- **Dart**: ^3.8.1

#### 주요 라이브러리

**상태 관리 & 아키텍처**
- `provider` ^6.1.2 - 상태 관리 (Provider 패턴)

**네트워킹 & 데이터**
- `http` ^1.2.2 - REST API 통신
- `shared_preferences` ^2.2.2 - 로컬 데이터 저장

**UI & 시각화**
- `fl_chart` ^0.68.0 - 일별 추이 그래프
- `confetti` ^0.7.0 - 행운의 지역 뽑기 애니메이션
- `flutter_spinkit` ^5.2.0 - 로딩 인디케이터
- `intl` ^0.19.0 - 날짜/숫자 포맷팅

**웹뷰 & 외부 연동**
- `webview_flutter` ^4.4.2 - 웹뷰 표시
- `url_launcher` ^6.2.2 - 외부 링크 열기
- `html` ^0.15.4 - HTML 파싱

**파일 처리**
- `excel` ^4.0.2 - Excel 파일 파싱
- `path_provider` ^2.1.1 - 파일 경로 관리
- `permission_handler` ^11.3.1 - 권한 관리

**광고**
- `google_mobile_ads` ^5.1.0 - AdMob 광고

**개발 도구**
- `flutter_launcher_icons` ^0.13.1 - 앱 아이콘 생성
- `flutter_lints` ^4.0.0 - 코드 품질 관리

### 백엔드 서버 (Node.js)

#### 핵심 프레임워크
- **Node.js** - 서버 런타임
- **Express** ^4.18.2 - 웹 서버 프레임워크

#### 주요 라이브러리

**웹 크롤링**
- `playwright` ^1.47.0 - 브라우저 자동화 및 크롤링

**데이터베이스**
- `mysql2` ^3.9.0 - MySQL 데이터베이스 연결

**API & 문서화**
- `swagger-jsdoc` ^6.2.8 - API 문서 자동 생성
- `swagger-ui-express` ^5.0.1 - Swagger UI 제공
- `cors` ^2.8.5 - CORS 정책 관리

**스케줄링 & 유틸리티**
- `node-cron` ^4.2.1 - 정기 크롤링 스케줄러
- `axios` ^1.10.0 - HTTP 클라이언트
- `xlsx` ^0.18.5 - Excel 파일 처리
- `dotenv` ^16.4.5 - 환경 변수 관리

**개발 도구**
- `nodemon` ^3.0.3 - 개발 서버 자동 재시작

## 🎨 아키텍처

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Flutter)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Screens   │  │ Providers  │  │  Widgets   │            │
│  │  (UI)      │←→│  (State)   │  │ (Charts)   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         ↓              ↓                                      │
│  ┌──────────────────────────────────────────┐               │
│  │          Services (API Layer)            │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTPS/HTTP
┌─────────────────────────────────────────────────────────────┐
│              Backend Server (Node.js/Express)                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Express   │  │  Scheduler │  │  Crawler   │            │
│  │  Router    │  │  (Cron)    │  │(Playwright)│            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         ↓              ↓                ↓                     │
│  ┌──────────────────────────────────────────┐               │
│  │          MySQL Database                  │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            Data Source (한국환경공단)                         │
│              https://ev.or.kr                                │
└─────────────────────────────────────────────────────────────┘
```

### Flutter 앱 아키텍처

```
lib/
├── main.dart                  # 앱 진입점, Provider 설정
│
├── models/                    # 데이터 모델 계층
│   └── subsidy_model.dart     # 보조금 데이터 모델
│
├── providers/                 # 상태 관리 계층 (Provider 패턴)
│   ├── subsidy_provider.dart     # 보조금 데이터 상태
│   └── car_model_provider.dart   # 차량 모델 데이터 상태
│
├── services/                  # 비즈니스 로직 & API 계층
│   ├── backend_api_service.dart  # 백엔드 API 통신
│   ├── car_model_service.dart    # 차량 모델 API
│   ├── subsidy_service.dart      # 보조금 비즈니스 로직
│   └── ad_service.dart           # AdMob 광고 관리
│
├── screens/                   # UI 화면 계층
│   ├── main_screen.dart              # 메인 (하단 네비게이터)
│   ├── home_screen.dart              # 지역별 보조금 화면
│   ├── car_model_search_screen.dart  # 차종별 보조금 화면
│   ├── subsidy_comparison_screen.dart # 모델별 지역 비교
│   ├── today_detail_screen.dart      # 지역 상세 정보
│   └── detail_screen.dart            # 구버전 상세 화면
│
└── widgets/                   # 재사용 가능한 위젯
    ├── subsidy_card.dart      # 보조금 카드 위젯
    └── daily_trend_chart.dart # 일별 추이 그래프
```

### 디자인 패턴

**1. Provider 패턴 (상태 관리)**
```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => SubsidyProvider()),
    ChangeNotifierProvider(create: (_) => CarModelProvider()),
  ],
  child: MaterialApp(...)
)
```

**2. Service 레이어 패턴**
- UI와 비즈니스 로직 분리
- API 통신 로직 캡슐화
- 재사용 가능한 서비스 모듈

**3. Repository 패턴**
- 데이터 소스 추상화
- 로컬/원격 데이터 통합 관리

## 🎯 주요 기능

### 1. 지역별 전기차 보조금 조회

**핵심 기능**
- 전국 161개 지역의 실시간 보조금 현황
- 지역별 공고, 신청, 출고 현황
- 신청 잔여/출고 잔여 수량 표시

**필터링 & 검색**
- 지역명/시도 검색
- 상태별 필터 (여유/신청가능/거의마감/마감)
- 실시간 데이터 새로고침

**상세 정보**
- 지역별 상세 현황 (우선/기업/택시/일반)
- 신청 방법 안내
- 일별 출고 잔여 추이 그래프 (30일)

### 2. 차종별 보조금 비교

**차량 모델 검색**
- 실시간 자동완성 검색
- 인기 모델 20개 기본 표시
- 제조사별 필터링

**보조금 비교**
- 157개 지역 보조금 자동 비교
- 최고/최저 혜택 지역 TOP 5
- 지역간 보조금 차이 계산
- 국고/지방 보조금 구성 내역

**스마트 추천**
- 🎰 행운의 지역 뽑기 (컨페티 애니메이션)
- 최대 절약 금액 계산

### 3. 데이터 시각화

**일별 출고 추이 그래프**
- FL Chart 라이브러리 사용
- 최근 30일간 출고 잔여 변화
- 지역별 고유 패턴 생성
- 주말 효과 반영
- 인터랙티브 툴팁

**통계 대시보드**
- 총 지역 수, 공고 수량
- 신청률, 출고율 시각화
- 진행률 바 표시

### 4. 광고 수익화

**Google AdMob 통합**
- 배너 광고
- 전면 광고 (화면 전환 시)
- app-ads.txt 정책 준수

## 📡 API 엔드포인트

### 백엔드 서버 URL
- **개발**: `http://localhost:3000` (Android: `http://10.0.2.2:3000`)
- **운영**: `https://ec2-43-202-104-181.ap-northeast-2.compute.amazonaws.com`

### 주요 API

**보조금 데이터**
```
GET /api/subsidy/today
  - 오늘의 보조금 현황 조회
  - Response: 161개 지역 데이터

GET /api/health
  - 서버 상태 확인
```

**차량 모델**
```
GET /api/car-models/search/models
  - 차량 모델 검색
  - Query: keyword, year, vehicleType, limit

GET /api/car-models/search/cheapest-regions
  - 모델별 최저 보조금 지역 검색
  - Query: manufacturer, modelName, year, vehicleType, topCount
```

**크롤링**
```
POST /api/crawl/subsidy
  - 보조금 데이터 크롤링 실행

GET /api/scheduler/status
  - 스케줄러 상태 확인
```

**문서화**
```
GET /api-docs
  - Swagger API 문서
```

## 🚀 설치 및 실행

### 사전 요구사항

**모바일 앱**
- Flutter SDK 3.32.4+
- Dart SDK ^3.8.1
- Android Studio / Xcode
- Android SDK / iOS SDK

**백엔드 서버**
- Node.js 16.x+
- MySQL 8.0+
- npm or yarn

### 모바일 앱 설치

```bash
# 프로젝트 클론
cd EVSubsidy

# 의존성 설치
flutter pub get

# 앱 아이콘 생성
flutter pub run flutter_launcher_icons

# 디버그 모드 실행
flutter run

# 릴리즈 빌드
flutter build apk --release         # Android APK
flutter build appbundle --release   # Play Store AAB
flutter build ios --release         # iOS (Mac 필요)
```

### 백엔드 서버 설치

```bash
# 프로젝트 클론
cd ev-crawling

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ev_subsidy
PORT=3000

# 서버 실행
npm start           # 프로덕션
npm run dev         # 개발 (nodemon)

# 크롤링 실행
npm run crawl
```

### MySQL 데이터베이스 설정

```sql
-- 데이터베이스 생성
CREATE DATABASE ev_subsidy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 테이블은 크롤러가 자동 생성
```

## 📊 데이터 흐름

### 1. 데이터 수집 (크롤링)

```
한국환경공단 (ev.or.kr)
         ↓
Playwright 크롤러 (매일 자동 실행)
         ↓
Excel 파일 다운로드 & 파싱
         ↓
MySQL 데이터베이스 저장
```

### 2. 데이터 제공 (API)

```
MySQL Database
         ↓
Express REST API
         ↓
Flutter HTTP Client
         ↓
Provider (State Management)
         ↓
UI Screens
```

### 3. 상태 관리 흐름

```
User Action (UI)
         ↓
Provider.method() 호출
         ↓
Service API 호출
         ↓
데이터 파싱 & 상태 업데이트
         ↓
notifyListeners()
         ↓
Consumer 위젯 리빌드
         ↓
UI 업데이트
```

## 🎨 주요 화면

### 1. 지역별 보조금 (HomeScreen)
- **메인 탭**: 161개 지역 보조금 현황
- **검색**: 지역명/시도 검색
- **필터**: 상태별 필터 (여유/마감 등)
- **통계**: 전체 공고, 신청, 잔여 현황

### 2. 차종별 보조금 (CarModelSearchScreen)
- **검색**: 차량 모델 자동완성 검색
- **인기 모델**: 20개 인기 전기차 표시
- **실시간 검색**: 2자 이상 입력 시 자동 검색

### 3. 보조금 비교 (SubsidyComparisonScreen)
- **요약**: 전체 지역, 최고/최저 보조금
- **TOP 5**: 최고 혜택 지역 5곳
- **BOTTOM 5**: 최저 혜택 지역 5곳
- **행운 뽑기**: 랜덤 추천 + 컨페티 애니메이션

### 4. 상세 현황 (TodayDetailScreen)
- **헤더**: 지역 정보, 차종, 기준 연도
- **그래프**: 일별 출고 잔여 30일 추이
- **현황**: 공고/신청/출고 상세 현황
- **출처 링크**: 한국환경공단 링크

## 🔐 개인정보 보호

### 수집하지 않는 정보
- 개인 식별 정보 없음
- 회원가입 불필요
- 로그인 불필요

### 수집하는 정보
- **광고 ID**: AdMob 광고 최적화용 (익명)
- **앱 사용 통계**: 익명화된 분석 데이터

### 정책 문서
- **개인정보처리방침**: `/public/privacy-policy.html`
- **app-ads.txt**: `/public/app-ads.txt`
- **준수**: Google Play 정책, AdMob 정책

## 🔄 자동화 & 스케줄링

### 크롤링 스케줄
- **매일 새벽 2시**: 보조금 데이터 자동 크롤링
- **매주 월요일**: 차량 모델 데이터 업데이트
- **node-cron** 사용

### 데이터 갱신 주기
- 보조금 현황: 일 1회
- 차량 모델: 주 1회
- 사용자는 앱에서 수동 새로고침 가능

## 📈 성능 최적화

### Flutter 앱
- **Tree Shaking**: MaterialIcons 99.8% 크기 감소
- **Code Splitting**: 화면별 지연 로딩
- **캐싱**: SharedPreferences로 로컬 캐싱
- **이미지 최적화**: 앱 아이콘 최적화

### 백엔드
- **데이터베이스 인덱싱**: 빠른 검색
- **API 응답 캐싱**: 반복 요청 최적화
- **연결 풀링**: MySQL 연결 재사용

## 🧪 테스트

### Flutter 앱
```bash
# 유닛 테스트
flutter test

# 위젯 테스트
flutter test test/widget_test.dart

# 통합 테스트
flutter drive --target=test_driver/app.dart
```

### 백엔드 서버
```bash
# API 테스트
curl http://localhost:3000/api/health

# 크롤링 테스트
curl -X POST http://localhost:3000/api/crawl/subsidy
```

## 📦 배포

### Android (Google Play Store)

```bash
# 릴리즈 빌드
flutter build appbundle --release

# 업로드
build/app/outputs/bundle/release/app-release.aab
```

**Play Console 설정**
- 앱 ID: `com.evsubsidy.app`
- 버전: 1.0.1 (16)
- 웹사이트: `https://ec2-43-202-104-181.ap-northeast-2.compute.amazonaws.com/privacy-policy.html`

### iOS (App Store)

```bash
# 릴리즈 빌드
flutter build ipa --release

# 또는
flutter build ios --release
```

### 백엔드 서버 (AWS EC2)

```bash
# PM2로 프로세스 관리
pm2 start server.js --name ev-crawling
pm2 save
pm2 startup
```

## 🛡️ 보안

### HTTPS 설정
- 릴리즈 모드: HTTPS 사용
- SSL 인증서: 자체 서명 인증서 허용 옵션

### API 보안
- CORS 정책 적용
- Rate Limiting (추후 추가 권장)
- 환경 변수로 민감 정보 관리

### 데이터 보호
- 개인정보 미수집
- 공개 데이터만 활용
- 암호화된 통신

## 📝 라이선스 & 면책조항

### 면책조항
⚠️ 본 앱은 정부기관을 대표하지 않는 비공식 정보 제공 앱입니다.
- 정부와의 공식 제휴 없음
- 참고용 정보만 제공
- 정확한 정보는 지자체/한국환경공단에 문의 필요

### 데이터 출처
- 환경부 전기자동차 보조금 지원현황
- 지방자치단체별 공개 데이터
- 한국환경공단 무공해차 통합누리집 (https://ev.or.kr)

### 라이선스
본 프로젝트는 교육 및 참고 목적으로 제공됩니다.

## 🤝 기여

### 개발자 정보
- **개발팀**: EV 보조금 조회 앱 개발팀
- **이메일**: kakaruto12@naver.com
- **문의**: 앱 내 문의하기 기능 이용

### 기여 방법
1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 문의 및 지원

### 앱 내 문의
- 앱 실행 → 설정 → 문의하기

### 버그 리포트
- GitHub Issues 또는 이메일로 제보

### 개인정보 문의
- 개인정보보호위원회: privacy.go.kr / 국번없이 182
- 개인정보 침해신고센터: 국번없이 182

## 🔄 업데이트 히스토리

### v1.0.1 (Build 16) - 2025-01-18
- ✨ 하단 네비게이터 추가 (지역별/차종별)
- 📊 일별 출고 잔여 현황 그래프
- 🎰 행운의 지역 뽑기 기능
- 🔗 정부 출처 링크 추가 (Google Play 정책 준수)
- 🌐 API 서버 변경 (새 EC2 인스턴스)
- 🎨 UI/UX 개선

### v1.0.0 (Build 12) - Initial Release
- 지역별 전기차 보조금 조회
- 차량 모델 검색 및 비교
- AdMob 광고 통합

## 🎓 학습 리소스

### Flutter
- [Flutter 공식 문서](https://flutter.dev/docs)
- [Provider 패턴](https://pub.dev/packages/provider)
- [FL Chart](https://pub.dev/packages/fl_chart)

### Node.js
- [Express 가이드](https://expressjs.com/)
- [Playwright 문서](https://playwright.dev/)
- [Swagger 설정](https://swagger.io/)

### 전기차 보조금
- [한국환경공단](https://ev.or.kr)
- [무공해차 통합누리집](https://www.ev.or.kr)

## 🎯 향후 계획

### 단기 목표
- [ ] 실제 일별 API 데이터 통합
- [ ] 푸시 알림 (보조금 마감 임박)
- [ ] 즐겨찾기 기능
- [ ] 공유 기능 (SNS)

### 중기 목표
- [ ] 사용자 리뷰 시스템
- [ ] 지역별 딜러 정보
- [ ] 보조금 신청 가이드
- [ ] 다크 모드 지원

### 장기 목표
- [ ] AI 기반 구매 추천
- [ ] 커뮤니티 기능
- [ ] 실시간 알림 서비스

## 📸 스크린샷

![홈 화면](screenshot_emulator.png)
![검색 화면](screenshot_emulator1.png)
![상세 화면](screenshot_emulator2.png)

---

**Made with ❤️ for EV adopters in Korea**
