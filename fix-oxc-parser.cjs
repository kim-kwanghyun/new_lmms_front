#!/usr/bin/env node
/**
 * oxc-parser 네이티브 바인딩 오류를 해결하기 위한 패치 스크립트
 * npm install 후 실행하거나 postinstall 스크립트에 추가
 */

const fs = require('fs')
const path = require('path')

// CommonJS 모듈에서는 __dirname이 자동으로 제공됨
const stubJsPath = path.join(__dirname, 'oxc-parser-stub.js')
const stubMjsPath = path.join(__dirname, 'oxc-parser-stub.mjs')

// oxc-parser 디렉토리 확인
const oxcParserDir = path.join(__dirname, 'node_modules', 'oxc-parser')

if (fs.existsSync(oxcParserDir)) {
  try {
    // 1. index.js와 index.mjs를 stub으로 교체 (ES 모듈 형식)
    const indexPath = path.join(oxcParserDir, 'index.js')
    const indexMjsPath = path.join(oxcParserDir, 'index.mjs')
    
    if (fs.existsSync(stubMjsPath)) {
      // index.mjs 생성 (ES 모듈)
      fs.copyFileSync(stubMjsPath, indexMjsPath)
      console.log('✓ oxc-parser/index.mjs created with stub (ESM)')
      
      // index.js도 stub으로 교체 (fallback)
      fs.copyFileSync(stubMjsPath, indexPath)
      console.log('✓ oxc-parser/index.js replaced with stub (ESM)')
      
      // package.json 수정하여 ES 모듈로 인식
      const pkgJsonPath = path.join(oxcParserDir, 'package.json')
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
          pkgJson.type = 'module'
          if (!pkgJson.exports) {
            pkgJson.exports = {}
          }
          pkgJson.exports['.'] = {
            'import': './index.mjs',
            'require': './index.js',
            'default': './index.mjs'
          }
          fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
          console.log('✓ oxc-parser/package.json updated for ES module support')
        } catch (e) {
          console.log('⚠ Could not update package.json:', e.message)
        }
      }
    } else if (fs.existsSync(stubJsPath)) {
      fs.copyFileSync(stubJsPath, indexPath)
      console.log('✓ oxc-parser/index.js replaced with stub (CJS)')
    }
    
    // 3. bindings.js를 stub으로 교체 (ES 모듈 형식 우선)
    const bindingsPath = path.join(oxcParserDir, 'bindings.js')
    if (fs.existsSync(bindingsPath)) {
      if (fs.existsSync(stubMjsPath)) {
        fs.copyFileSync(stubMjsPath, bindingsPath)
        console.log('✓ oxc-parser/bindings.js replaced with stub (ESM)')
      } else if (fs.existsSync(stubJsPath)) {
        fs.copyFileSync(stubJsPath, bindingsPath)
        console.log('✓ oxc-parser/bindings.js replaced with stub (CJS)')
      }
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
        if (fs.existsSync(stubMjsPath)) {
          // ES 모듈 형식의 stub 사용
          fs.copyFileSync(stubMjsPath, pkgIndex)
          console.log(`✓ ${pkg}/index.js replaced with stub (ESM)`)
        } else if (fs.existsSync(stubJsPath)) {
          fs.copyFileSync(stubJsPath, pkgIndex)
          console.log(`✓ ${pkg}/index.js replaced with stub (CJS)`)
        }
        
        // index.mjs도 교체
        const pkgIndexMjs = path.join(pkgDir, 'index.mjs')
        if (fs.existsSync(stubMjsPath)) {
          fs.copyFileSync(stubMjsPath, pkgIndexMjs)
          console.log(`✓ ${pkg}/index.mjs replaced with stub`)
        }
        
        // package.json도 수정
        const pkgPkgJsonPath = path.join(pkgDir, 'package.json')
        if (fs.existsSync(pkgPkgJsonPath)) {
          try {
            const pkgPkgJson = JSON.parse(fs.readFileSync(pkgPkgJsonPath, 'utf8'))
            pkgPkgJson.type = 'module'
            if (!pkgPkgJson.exports) {
              pkgPkgJson.exports = {}
            }
            pkgPkgJson.exports['.'] = {
              'import': './index.mjs',
              'require': './index.js',
              'default': './index.mjs'
            }
            fs.writeFileSync(pkgPkgJsonPath, JSON.stringify(pkgPkgJson, null, 2))
            console.log(`✓ ${pkg}/package.json updated for ES module support`)
          } catch (e) {
            // 무시
          }
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
