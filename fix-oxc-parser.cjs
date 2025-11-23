#!/usr/bin/env node
/**
 * oxc-parser 네이티브 바인딩 오류를 해결하기 위한 패치 스크립트
 * npm install 후 실행하거나 postinstall 스크립트에 추가
 */

const fs = require('fs')
const path = require('path')

// 여러 가능한 경로 확인
const possiblePaths = [
  path.join(__dirname, 'node_modules', 'oxc-parser', 'bindings.js'),
  path.join(__dirname, 'node_modules', 'oxc-parser', 'src-js', 'bindings.js'),
]

let oxcParserPath = null
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    oxcParserPath = p
    break
  }
}

if (oxcParserPath) {
  try {
    let content = fs.readFileSync(oxcParserPath, 'utf8')
    const backupPath = oxcParserPath + '.backup'
    
    // 백업 생성 (없는 경우만)
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content, 'utf8')
      console.log(`Created backup: ${backupPath}`)
    }
    
    // 이미 패치되었는지 확인
    if (content.includes('Patched to prevent native binding errors')) {
      // 문법 검사
      try {
        require('vm').createScript(content).runInNewContext({ require, module: {}, exports: {} })
        console.log('✓ oxc-parser bindings.js already patched and syntax OK')
        process.exit(0)
      } catch (e) {
        console.log('⚠ Syntax error detected in patched file, restoring from backup...')
        if (fs.existsSync(backupPath)) {
          content = fs.readFileSync(backupPath, 'utf8')
        } else {
          console.log('⚠ No backup found, reinstalling required')
          process.exit(1)
        }
      }
    }
    
    console.log(`Patching ${oxcParserPath}...`)
    
    // 안전한 패치: 파일 시작 부분에만 Module.prototype.require 오버라이드 추가
    // 기존 코드는 전혀 수정하지 않음
    const patch = `// Patched to prevent native binding errors - DO NOT REMOVE
(function() {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function(id) {
    if (id && typeof id === 'string' && (
      id.includes('oxc-parser') || 
      id.includes('binding-linux') || 
      id.includes('binding-win') || 
      id.includes('binding-darwin') ||
      id.includes('parser.linux') ||
      id.includes('parser.win') ||
      id.includes('parser.darwin')
    )) {
      try {
        return originalRequire.apply(this, arguments);
      } catch (e) {
        return {};
      }
    }
    return originalRequire.apply(this, arguments);
  };
})();

`
    
    // 패치를 파일 시작 부분에 추가 (기존 내용은 그대로 유지)
    content = patch + content
    
    // 문법 검사
    try {
      require('vm').createScript(content).runInNewContext({ require, module: {}, exports: {} })
    } catch (e) {
      console.error('✗ Syntax error in patched content, restoring backup...')
      if (fs.existsSync(backupPath)) {
        content = fs.readFileSync(backupPath, 'utf8')
        fs.writeFileSync(oxcParserPath, content, 'utf8')
      }
      throw new Error('Failed to create valid patch: ' + e.message)
    }
    
    // 파일 저장
    fs.writeFileSync(oxcParserPath, content, 'utf8')
    console.log('✓ oxc-parser bindings.js patched successfully')
  } catch (error) {
    console.error('✗ Failed to patch oxc-parser:', error.message)
    console.error('Error stack:', error.stack)
    // 패치 실패해도 계속 진행
    process.exit(0)
  }
} else {
  console.log('ℹ oxc-parser not found, skipping patch')
}

