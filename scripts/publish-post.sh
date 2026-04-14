#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env.local 파일을 찾을 수 없습니다: $ENV_FILE"
  exit 1
fi

load_env() {
  local key="$1"
  grep "^${key}=" "$ENV_FILE" | head -1 | cut -d'=' -f2-
}

BLOG_API_URL=$(load_env "BLOG_API_URL")
BLOG_ADMIN_EMAIL=$(load_env "BLOG_ADMIN_EMAIL")
BLOG_ADMIN_PASSWORD=$(load_env "BLOG_ADMIN_PASSWORD")

if [ -z "$BLOG_API_URL" ] || [ -z "$BLOG_ADMIN_EMAIL" ] || [ -z "$BLOG_ADMIN_PASSWORD" ]; then
  echo "ERROR: .env.local에 BLOG_API_URL, BLOG_ADMIN_EMAIL, BLOG_ADMIN_PASSWORD가 필요합니다."
  exit 1
fi

usage() {
  echo "사용법: $0 --title <제목> --content <본문> [--tags <태그1,태그2>] [--category-id <ID>] [--private]"
  echo ""
  echo "옵션:"
  echo "  --title        게시글 제목 (필수)"
  echo "  --content      게시글 본문 (필수)"
  echo "  --content-file 본문을 파일에서 읽기 (--content 대신 사용)"
  echo "  --tags         쉼표로 구분된 태그 목록"
  echo "  --category-id  카테고리 ID (숫자)"
  echo "  --private      비공개 게시글로 설정"
  echo "  --dry-run      실제 업로드 없이 페이로드만 출력"
  exit 1
}

TITLE=""
CONTENT=""
TAGS=""
CATEGORY_ID=""
IS_PRIVATE="false"
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case $1 in
    --title) TITLE="$2"; shift 2 ;;
    --content) CONTENT="$2"; shift 2 ;;
    --content-file)
      if [ ! -f "$2" ]; then
        echo "ERROR: 파일을 찾을 수 없습니다: $2"
        exit 1
      fi
      CONTENT=$(cat "$2")
      shift 2
      ;;
    --tags) TAGS="$2"; shift 2 ;;
    --category-id) CATEGORY_ID="$2"; shift 2 ;;
    --private) IS_PRIVATE="true"; shift ;;
    --dry-run) DRY_RUN="true"; shift ;;
    *) echo "알 수 없는 옵션: $1"; usage ;;
  esac
done

if [ -z "$TITLE" ] || [ -z "$CONTENT" ]; then
  echo "ERROR: --title과 --content (또는 --content-file)는 필수입니다."
  usage
fi

# 태그를 JSON 배열로 변환
if [ -n "$TAGS" ]; then
  TAGS_JSON=$(echo "$TAGS" | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | jq -R . | jq -s .)
else
  TAGS_JSON="[]"
fi

# categoryId 처리
if [ -n "$CATEGORY_ID" ]; then
  CATEGORY_JSON="$CATEGORY_ID"
else
  CATEGORY_JSON="null"
fi

# JSON 페이로드 구성
PAYLOAD=$(jq -n \
  --arg title "$TITLE" \
  --arg content "$CONTENT" \
  --argjson tags "$TAGS_JSON" \
  --argjson isPrivate "$IS_PRIVATE" \
  --argjson categoryId "$CATEGORY_JSON" \
  '{title: $title, content: $content, tags: $tags, isPrivate: $isPrivate, categoryId: $categoryId}')

if [ "$DRY_RUN" = "true" ]; then
  echo "=== DRY RUN ==="
  echo "API URL: $BLOG_API_URL/api/posts"
  echo "페이로드:"
  echo "$PAYLOAD" | jq .
  echo "==============="
  exit 0
fi

# 로그인하여 JWT 토큰 발급
echo "로그인 중..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$BLOG_API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$BLOG_ADMIN_EMAIL\",\"password\":\"$BLOG_ADMIN_PASSWORD\"}")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_HTTP_CODE" != "200" ]; then
  echo "ERROR: 로그인 실패 (HTTP $LOGIN_HTTP_CODE)"
  echo "$LOGIN_BODY" | jq . 2>/dev/null || echo "$LOGIN_BODY"
  exit 1
fi

TOKEN=$(echo "$LOGIN_BODY" | jq -r '.token')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "ERROR: 토큰을 받지 못했습니다."
  echo "$LOGIN_BODY"
  exit 1
fi
echo "로그인 성공!"

# 게시글 업로드
echo "게시글 업로드 중..."
POST_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$BLOG_API_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PAYLOAD")

POST_HTTP_CODE=$(echo "$POST_RESPONSE" | tail -1)
POST_BODY=$(echo "$POST_RESPONSE" | sed '$d')

if [ "$POST_HTTP_CODE" = "200" ] || [ "$POST_HTTP_CODE" = "201" ]; then
  POST_ID=$(echo "$POST_BODY" | jq -r '.id')
  POST_TITLE=$(echo "$POST_BODY" | jq -r '.title')
  echo ""
  echo "업로드 성공!"
  echo "  제목: $POST_TITLE"
  echo "  ID: $POST_ID"
  echo "  URL: $BLOG_API_URL/posts/$POST_ID"
else
  echo "ERROR: 게시글 업로드 실패 (HTTP $POST_HTTP_CODE)"
  echo "$POST_BODY" | jq . 2>/dev/null || echo "$POST_BODY"
  exit 1
fi
