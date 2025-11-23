#!/bin/bash
# 리눅스 서버용 설치 스크립트
# 사용하지 않는 optional dependencies 설치를 건너뜀

set -e

echo "🔧 리눅스 서버용 패키지 설치 시작..."

# oxc-parser 관련 패키지 제외하고 설치
npm install --no-optional --ignore-scripts

# oxc-parser 패치 실행
echo "🔧 oxc-parser 패치 적용 중..."
node fix-oxc-parser.cjs || true

# nuxt prepare 실행
echo "🔧 Nuxt 준비 중..."
nuxt prepare 2>&1 | grep -v 'oxc-parser' || true

echo "✅ 설치 완료!"

