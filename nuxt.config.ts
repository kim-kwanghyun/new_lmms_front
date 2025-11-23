// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false }, // DevTools 비활성화
  
  // 실험적 기능 설정 (DevalueError 방지)
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: false
  },

  // TypeScript 설정
  typescript: {
    typeCheck: false, // 개발 시 타입 체크 비활성화로 성능 향상
    strict: false,
    includeWorkspace: false
  },
  
  // SSR 설정
  ssr: true,

  // 개발 서버 설정
  devServer: {
    host: '0.0.0.0',
    port: 8205
  },

  // 전역 Head 설정 (기본 title, meta 등)
  app: {
    head: {
      title: '인증관리 시스템', // 기본 title
      titleTemplate: '%s - 인증관리 시스템', // 페이지별 title 템플릿
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '인증관리 시스템 - 직무, 권한, 공통관리를 위한 통합 시스템' },
        { name: 'keywords', content: '인증관리, 직무관리, 권한관리, 공통관리' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64x64.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/favicon-128x128.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },
  
  // 런타임 설정
  runtimeConfig: {
    // 서버 사이드에서만 접근 가능한 설정
    apiSecret: '',
    
    // 클라이언트와 서버 양쪽에서 접근 가능한 설정
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8080'
    }
  },
  
  // CSS 파일들 (전역 CSS 및 필요한 스타일시트)
  css: [
    '~/assets/css/main.css' // assets 폴더의 CSS 파일 사용
  ],
  
  // 모듈
  modules: [],
  
  // hooks를 사용하여 oxc-parser 로드 방지
  hooks: {
    'vite:extendConfig'(config: any) {
      // Vite 설정 확장
      if (!config.resolve) {
        config.resolve = {}
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {}
      }
      // oxc-parser alias 추가
      config.resolve.alias['oxc-parser'] = join(__dirname, 'oxc-parser-stub.mjs')
      config.resolve.alias['@oxc-parser/binding-linux-x64-gnu'] = join(__dirname, 'oxc-parser-stub.mjs')
      config.resolve.alias['@oxc-parser/binding-linux-x64-musl'] = join(__dirname, 'oxc-parser-stub.mjs')
      config.resolve.alias['@oxc-parser/binding-linux-arm64-gnu'] = join(__dirname, 'oxc-parser-stub.mjs')
      config.resolve.alias['@oxc-parser/binding-linux-arm64-musl'] = join(__dirname, 'oxc-parser-stub.mjs')
    }
  },

  // Vite 설정
  vite: {
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        // oxc-parser를 빈 모듈로 대체하여 네이티브 바인딩 오류 방지
        'oxc-parser': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-linux-x64-gnu': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-linux-x64-musl': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-linux-arm64-gnu': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-linux-arm64-musl': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-win32-x64-msvc': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-darwin-x64': join(__dirname, 'oxc-parser-stub.mjs'),
        '@oxc-parser/binding-darwin-arm64': join(__dirname, 'oxc-parser-stub.mjs'),
      }
    },
    optimizeDeps: {
      include: ['jsonwebtoken', 'neo4j-driver', 'crypto-js'],
      exclude: ['oxc-parser']
    },
    build: {
      rollupOptions: {
        external: ['oxc-parser']
      }
    },
    esbuild: {
      target: 'esnext'
    }
  },

  // 커스텀 로딩 화면 설정 (Nuxt 3에서는 app.vue에서 처리)
  // loading: '~/components/LoadingScreen.vue',
  
  // 라우트 규칙 설정
  routeRules: {
    '/index': { redirect: '/' },
    // API 라우트는 SSR 비활성화
    '/api/**': { ssr: false }
  },
  
  // Nitro 설정
  nitro: {
    routeRules: {
      '/index': { redirect: '/' },
      '/api/**': { ssr: false }
    },
    // oxc-parser 제외
    experimental: {
      wasm: false
    },
    // 외부 모듈로 처리
    externals: {
      inline: ['oxc-parser']
    },
    // Nitro에서도 alias 설정
    alias: {
      'oxc-parser': join(__dirname, 'oxc-parser-stub.mjs'),
      '@oxc-parser/binding-linux-x64-gnu': join(__dirname, 'oxc-parser-stub.mjs'),
      '@oxc-parser/binding-linux-x64-musl': join(__dirname, 'oxc-parser-stub.mjs'),
      '@oxc-parser/binding-linux-arm64-gnu': join(__dirname, 'oxc-parser-stub.mjs'),
      '@oxc-parser/binding-linux-arm64-musl': join(__dirname, 'oxc-parser-stub.mjs'),
    }
  }
})
