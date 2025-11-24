# Git Pull 오류 해결 방법

## 오류 원인
리눅스 서버에 로컬 변경사항이 있어서 원격 저장소의 변경사항을 가져올 때 충돌이 발생합니다.

## 해결 방법

### 방법 1: 변경사항 커밋 후 Pull (권장)

```bash
# 1. 현재 변경사항 확인
git status

# 2. 변경사항 스테이징
git add fix-oxc-parser.cjs nuxt.config.ts oxc-parser-stub.js oxc-parser-stub.mjs package-lock.json package.json tsconfig.json scripts/prepare-and-build.cjs

# 3. 커밋
git commit -m "로컬 변경사항 커밋: oxc-parser 수정, nuxt 설정 업데이트"

# 4. Pull 실행
git pull
```

### 방법 2: 변경사항 Stash 후 Pull

```bash
# 1. 변경사항 임시 저장
git stash

# 2. 추적되지 않은 파일 처리 (prepare-and-build.cjs)
# 파일을 임시로 다른 곳에 백업
mv scripts/prepare-and-build.cjs scripts/prepare-and-build.cjs.backup

# 3. Pull 실행
git pull

# 4. Stash한 변경사항 복원
git stash pop

# 5. 백업한 파일 복원 (필요한 경우)
mv scripts/prepare-and-build.cjs.backup scripts/prepare-and-build.cjs
```

### 방법 3: 원격 변경사항 강제로 가져오기 (주의: 로컬 변경사항 손실)

```bash
# ⚠️ 경고: 이 방법은 로컬 변경사항을 모두 버립니다!

# 1. 현재 변경사항 모두 버리기
git reset --hard HEAD

# 2. 추적되지 않은 파일 삭제
rm scripts/prepare-and-build.cjs

# 3. Pull 실행
git pull
```

## 추천 순서

1. **먼저 방법 1 시도** - 로컬 변경사항을 커밋하고 pull
2. **충돌 발생 시** - `git pull` 후 충돌 파일 수동 해결
3. **변경사항이 불필요하면** - 방법 3 사용 (주의 필요)

## 충돌 해결 후

```bash
# 충돌 해결 후
git add .
git commit -m "충돌 해결 완료"
git push
```

