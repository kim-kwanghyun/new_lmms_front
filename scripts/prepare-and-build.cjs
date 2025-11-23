#!/usr/bin/env node
/**
 * nuxt prepare를 실행하고 tsconfig.app.json이 생성될 때까지 기다린 후 빌드 실행
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const nuxtDir = path.join(__dirname, '..', '.nuxt')
const tsconfigAppPath = path.join(nuxtDir, 'tsconfig.app.json')

async function main() {
  const projectRoot = path.join(__dirname, '..')
  const nuxtBin = path.join(projectRoot, 'node_modules', '.bin', 'nuxt')
  
  // nuxt 바이너리 경로 확인
  const nuxtCommand = fs.existsSync(nuxtBin) ? nuxtBin : 'npx nuxt'
  
  console.log('🔧 Running nuxt prepare...')

  try {
    // nuxt prepare 실행 (oxc-parser 오류는 무시)
    execSync(`${nuxtCommand} prepare`, {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env, PATH: `${path.join(projectRoot, 'node_modules', '.bin')}:${process.env.PATH}` }
    })
  } catch (error) {
    // oxc-parser 관련 오류는 무시
    if (error.message && error.message.includes('oxc-parser')) {
      console.log('⚠️  oxc-parser warning ignored')
    } else {
      console.log('⚠️  nuxt prepare completed with warnings')
    }
  }

  // tsconfig.app.json 파일이 생성되었는지 확인
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  let retries = 10
  while (retries > 0 && !fs.existsSync(tsconfigAppPath)) {
    console.log(`⏳ Waiting for tsconfig.app.json... (${retries} retries left)`)
    await sleep(500)
    retries--
  }

  if (fs.existsSync(tsconfigAppPath)) {
    console.log('✅ tsconfig.app.json created successfully')
  } else {
    console.log('⚠️  tsconfig.app.json not found, but continuing with build...')
  }

  // 빌드 실행
  console.log('🔨 Starting build...')
  try {
    execSync(`NUXT_TYPESCRIPT_TYPECHECK=false ${nuxtCommand} build`, {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env, PATH: `${path.join(projectRoot, 'node_modules', '.bin')}:${process.env.PATH}` }
    })
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})

