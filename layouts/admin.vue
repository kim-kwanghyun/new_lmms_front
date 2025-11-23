<template>
  <div>
    <!-- Head 설정 -->
    <Head>
      <title>{{ title || '인증관리 시스템' }}</title>
      <meta name="description" content="NiceAdmin Bootstrap Template for Nuxt.js" />
      <meta name="keywords" content="admin, bootstrap, template, nuxt" />
      
      <!-- Favicons -->
      <link href="/favicon.ico" rel="icon" />
      <link href="/favicon-16x16.png" rel="icon" sizes="16x16" />
      <link href="/favicon-32x32.png" rel="icon" sizes="32x32" />
      <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      <link href="/site.webmanifest" rel="manifest" />
      
      <!-- Google Fonts -->
      <link href="https://fonts.gstatic.com" rel="preconnect" />
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet" />
      
      <!-- 추가 CSS Files (기본 CSS는 app.vue에서 로드됨) -->
      <link href="/assets/vendor/quill/quill.snow.css" rel="stylesheet" />
      <link href="/assets/vendor/quill/quill.bubble.css" rel="stylesheet" />
      <link href="/assets/vendor/simple-datatables/style.css" rel="stylesheet" />
    </Head>

    <!-- Header -->
    <AdminHeader />

    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main id="main" class="main">
      <slot />
    </main>

    <!-- Footer -->
    <AdminFooter />

    <!-- Back to top button -->
    <a href="#" class="back-to-top d-flex align-items-center justify-content-center">
      <i class="bi bi-arrow-up-short"></i>
    </a>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'NiceAdmin - Nuxt.js'
})
</script>

<style>
/* Admin 레이아웃 - 사이드바와 메인 콘텐츠 분리 */
.main {
  margin-left: 280px; /* 사이드바 너비만큼 여백 */
  padding: 20px;
  min-height: 100vh;
  transition: all 0.3s;
}

/* 헤더 스타일 */
#header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 997;
  transition: all 0.5s;
  padding: 0;
  background: #2c3e50;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #34495e;
}

/* 사이드바 스타일 */
#sidebar {
  position: fixed;
  top: 60px; /* 헤더 높이만큼 아래로 */
  left: 0;
  bottom: 0;
  width: 280px;
  z-index: 996;
  transition: all 0.3s;
  padding: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
  border-right: 1px solid #e9ecef;
}

/* 푸터 위치 조정 */
#footer {
  margin-left: 280px;
  transition: all 0.3s;
}

/* Back to top 버튼 위치 조정 */
.back-to-top {
  right: 15px !important;
  bottom: 15px !important;
}

/* 사이드바가 숨겨진 상태 */
body.toggle-sidebar .main,
body.toggle-sidebar #footer {
  margin-left: 0;
}

body.toggle-sidebar #sidebar {
  left: -280px;
}

/* 반응형 디자인 */
@media (max-width: 1199px) {
  #sidebar {
    left: -280px;
  }
  
  .main,
  #footer {
    margin-left: 0;
  }
  
  body.sidebar-show #sidebar {
    left: 0;
  }
}

/* 모바일 디자인 */
@media (max-width: 768px) {
  .main {
    padding: 15px;
  }
  
  #header {
    padding: 15px 0;
  }
  
  #sidebar {
    top: 50px;
    width: 280px;
  }
}

/* 작은 모바일 화면 */
@media (max-width: 576px) {
  .main {
    padding: 10px;
  }
  
  #sidebar {
    width: 100%;
    top: 50px;
  }
}
</style>
