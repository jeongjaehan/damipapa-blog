# 반박이 (BanBak-i)

AI 기반 논리적 오류 분석 및 반박문 생성 시스템

## 프로젝트 소개

온라인 콘텐츠(기사, 블로그, SNS 게시글)의 논리적 구조를 자동으로 분석하고, 논리적 오류를 감지하여 팩트 기반 반박문을 생성하는 웹 애플리케이션입니다.

## 주요 기능

- 🔍 **URL 기반 자동 크롤링**: Playwright를 활용한 동적 콘텐츠 추출
- 🧠 **AI 논리 분석**: GPT-4 기반 주장-근거-추론 구조 분석
- ⚠️ **논리적 오류 감지**: 8가지 유형의 논리적 오류 자동 탐지
- ✍️ **반박문 자동 생성**: 3가지 스타일(논리, 팩트, 감정적 균형)
- 📊 **신뢰도 평가**: 주장별 신뢰도 점수 및 근거 수준 평가

## 기술 스택

**Frontend**: React, TypeScript, Tailwind CSS  
**Backend**: Node.js, Express, TypeScript  
**AI**: OpenAI GPT-4 API  
**Crawler**: Playwright

## 시작하기

```bash
# 저장소 클론
git clone https://github.com/jaehan4707/banbakcom.git

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 OPENAI_API_KEY 설정

# 개발 서버 실행
npm run dev
```

## 사용 방법

1. 분석할 콘텐츠의 URL 입력
2. 반박문 스타일 선택 (논리 중심 / 팩트 중심 / 감정적 균형형)
3. 분석 시작 버튼 클릭
4. 결과 확인 및 다운로드

## 감지 가능한 논리적 오류

1. **인신공격 (Ad Hominem)**: 논점이 아닌 사람을 공격
2. **허수아비 논법 (Straw Man)**: 상대 주장 왜곡 후 반박
3. **성급한 일반화 (Hasty Generalization)**: 불충분한 증거로 일반화
4. **잘못된 인과관계 (False Cause)**: 인과관계 오류
5. **권위에의 호소 (Appeal to Authority)**: 권위에만 의존
6. **흑백논리 (False Dilemma)**: 극단적 양자택일 강요
7. **미끄러운 경사면 (Slippery Slope)**: 극단적 결과 예측
8. **순환논증 (Circular Reasoning)**: 결론을 전제로 사용

## 프로젝트 상태

현재 개발 진행 중 (In Progress)

## 라이선스

MIT License

## 기여하기

이슈와 Pull Request를 환영합니다!

## 문의

GitHub Issues를 통해 문의해주세요.

