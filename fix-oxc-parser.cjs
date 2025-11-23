#!/usr/bin/env node
/**
 * oxc-parser 네이티브 바인딩 오류를 해결하기 위한 패치 스크립트
 * npm install 후 실행하거나 postinstall 스크립트에 추가
 */

const fs = require('fs')
const path = require('path')

// __dirname 정의 (ES 모듈 환경 대응)
const __dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd()

const stubJsPath = path.join(__dirname, 'oxc-parser-stub.js')
const stubMjsPath = path.join(__dirname, 'oxc-parser-stub.mjs')

// oxc-parser 디렉토리 확인
const oxcParserDir = path.join(__dirname, 'node_modules', 'oxc-parser')

if (fs.existsSync(oxcParserDir)) {
  try {
    // 1. index.js를 stub으로 교체
    const indexPath = path.join(oxcParserDir, 'index.js')
    if (fs.existsSync(stubJsPath)) {
      fs.copyFileSync(stubJsPath, indexPath)
      console.log('✓ oxc-parser/index.js replaced with stub')
    }
    
    // 2. index.mjs도 stub으로 교체 (있는 경우)
    const indexMjsPath = path.join(oxcParserDir, 'index.mjs')
    if (fs.existsSync(stubMjsPath)) {
      fs.copyFileSync(stubMjsPath, indexMjsPath)
      console.log('✓ oxc-parser/index.mjs replaced with stub')
    }
    
    // 3. bindings.js를 stub으로 교체
    const bindingsPath = path.join(oxcParserDir, 'bindings.js')
    if (fs.existsSync(bindingsPath) && fs.existsSync(stubJsPath)) {
      fs.copyFileSync(stubJsPath, bindingsPath)
      console.log('✓ oxc-parser/bindings.js replaced with stub')
    }
    
    // 4. @oxc-parser 바인딩 패키지들도 stub으로 교체
    const bindingPackages = [
      '@oxc-parser/binding-linux-x64-gnu',
      '@oxc-parser/binding-linux-x64-musl',
      '@oxc-parser/binding-linux-arm64-gnu',
      '@oxc-parser/binding-linux-arm64-musl'
    ]
    
    for (const pkg of bindingPackages) {
      const pkgDir = path.join(__dirname, 'node_modules', pkg)
      if (fs.existsSync(pkgDir)) {
        const pkgIndex = path.join(pkgDir, 'index.js')
        if (fs.existsSync(stubJsPath)) {
          fs.copyFileSync(stubJsPath, pkgIndex)
          console.log(`✓ ${pkg}/index.js replaced with stub`)
        }
        
        // index.mjs도 교체 (있는 경우)
        const pkgIndexMjs = path.join(pkgDir, 'index.mjs')
        if (fs.existsSync(stubMjsPath)) {
          fs.copyFileSync(stubMjsPath, pkgIndexMjs)
          console.log(`✓ ${pkg}/index.mjs replaced with stub`)
        }
      }
    }
    
    console.log('✓ oxc-parser patched successfully')
  } catch (error) {
    console.error('✗ Failed to patch oxc-parser:', error.message)
    console.error('Error stack:', error.stack)
    process.exit(0) // 실패해도 계속 진행
  }
} else {
  console.log('ℹ oxc-parser not found, skipping patch')
}