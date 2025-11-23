<template>
  <!-- 좌측 사이드바 -->
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">Menu</h3>
    </div>
    <ul class="sidebar-nav" id="sidebar-nav">
      
      <!-- Dashboard -->
      <li class="nav-item">
        <NuxtLink class="nav-link" to="/">
          <i class="bi bi-grid"></i>
          <span>Dashboard</span>
        </NuxtLink>
      </li><!-- End Dashboard Nav -->

      <!-- 코드관리 메뉴 -->
      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#components-nav" aria-expanded="false" aria-controls="components-nav" href="#">
          <i class="bi bi-menu-button-wide"></i><span>지식관리</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="components-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
          <li>
            <NuxtLink to="/manual/manual_list" :class="{ active: isActive('/manual/manual_list') }">
              <i class="bi bi-circle"></i><span>지식관리</span>
            </NuxtLink>
          </li>         
        </ul>
      </li><!-- End Components Nav -->

      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#components-nav1" aria-expanded="false" aria-controls="components-nav1" href="#">
          <i class="bi bi-menu-button-wide"></i><span>meta 관리</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="components-nav1" class="nav-content collapse" data-bs-parent="#sidebar-nav">
        
          <li>
            <NuxtLink to="/manual/metadata_list" :class="{ active: isActive('/manual/metadata_list') }">
              <i class="bi bi-circle"></i><span>Metadata관리</span>
            </NuxtLink>
          </li>
        </ul>
      </li><!-- End Components -->
      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#calendar-nav" aria-expanded="false" aria-controls="calendar-nav" href="#">
          <i class="bi bi-calendar3"></i><span>일정 관리</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="calendar-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
        
          <li>
            <NuxtLink to="/calendar/calendar" :class="{ active: isActive('/calendar/calendar') }">
              <i class="bi bi-circle"></i><span>일정 관리</span>
            </NuxtLink>
          </li>
        </ul>
      </li><!-- End Calendar Nav -->
      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#bbs-nav" aria-expanded="false" aria-controls="bbs-nav" href="#">
          <i class="bi bi-calendar3"></i><span>파일게시판</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="bbs-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
        
          <li>
            <NuxtLink to="/bbs/bbs" :class="{ active: isActive('/bbs/bbs') }">
              <i class="bi bi-circle"></i><span>파일게시판</span>
            </NuxtLink>
          </li>
        </ul>
      </li><!-- End Calendar Nav -->

      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#livestock-nav" aria-expanded="false" aria-controls="livestock-nav" href="#">
          <i class="bi bi-house-door"></i><span>축사 관리</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="livestock-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
          <li>
            <NuxtLink to="/livestock/rooms" :class="{ active: isActive('/livestock/rooms') }">
              <i class="bi bi-circle"></i><span>축사방 관리</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/pigs/management" :class="{ active: isActive('/pigs/management') }">
              <i class="bi bi-circle"></i><span>돼지 입출고 관리</span>
            </NuxtLink>
          </li>
          <!--
          <li>
            <NuxtLink to="/feeding/management" :class="{ active: isActive('/feeding/management') }">
              <i class="bi bi-circle"></i><span>급이량/급수량 관리</span>
            </NuxtLink>
          </li>
        -->
          <li>
            <NuxtLink to="/feeding/sen_intime" :class="{ active: isActive('/feeding/sen_intime') }">
              <i class="bi bi-circle"></i><span>실시간 급이량</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/feeding/sen_status" :class="{ active: isActive('/feeding/sen_status') }">
              <i class="bi bi-circle"></i><span>실시간 센서상태</span>
            </NuxtLink>
          </li>
        </ul>
      </li><!-- End Livestock Nav -->

      <!-- AI 메뉴 -->
      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#ai-nav" aria-expanded="false" aria-controls="ai-nav" href="#">
          <i class="bi bi-robot"></i><span>AI</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="ai-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
          <li>
            <NuxtLink to="/llm/llm" :class="{ active: isActive('/llm/llm') }">
              <i class="bi bi-circle"></i><span>LLM Console</span>
            </NuxtLink>
          </li>
        </ul>
      </li><!-- End AI Nav -->

      

      <!-- 회원관리 메뉴 -->
      <li class="nav-item">
        <a class="nav-link collapsed" data-bs-toggle="collapse" data-bs-target="#member-nav" aria-expanded="false" aria-controls="member-nav" href="#">
          <i class="bi bi-person"></i><span>회원관리</span><i class="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="member-nav" class="nav-content collapse" data-bs-parent="#sidebar-nav">
          <li>
            <NuxtLink to="/member/login" :class="{ active: isActive('/member/login') }">
              <i class="bi bi-circle"></i><span>로그인</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/member/register" :class="{ active: isActive('/member/register') }">
              <i class="bi bi-circle"></i><span>회원가입</span>
            </NuxtLink>
          </li>
        </ul>
      </li><!-- End Member Nav -->

    </ul>
  </aside><!-- End Sidebar-->
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 현재 경로가 활성 상태인지 확인
const isActive = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
/* 사이드바 기본 스타일 */
.sidebar {
  position: fixed;
  top: 60px;
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

/* 사이드바 헤더 */
.sidebar-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e9ecef;
  background-color: #fff;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  background-color: #fff;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #aab7cf;
}

@media (max-width: 1199px) {
  .sidebar {
    left: -300px;
  }
}

.sidebar-nav {
  padding: 16px 0;
  margin: 0;
  list-style: none;
}

.sidebar-nav .nav-item {
  margin-bottom: 2px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease;
  background: transparent;
  padding: 12px 24px;
  border-radius: 0;
  text-decoration: none;
  border-left: 3px solid transparent;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar-nav .nav-link i {
  font-size: 16px;
  margin-right: 12px;
  color: #6c757d;
  width: 20px;
  text-align: center;
}

.sidebar-nav .nav-link.collapsed {
  color: #495057;
  background: transparent;
}

.sidebar-nav .nav-link.collapsed i {
  color: #6c757d;
}

.sidebar-nav .nav-link:hover {
  color: #007bff;
  background: #e3f2fd;
  border-left-color: #007bff;
}

.sidebar-nav .nav-link:hover i {
  color: #007bff;
}

.sidebar-nav .nav-link.active {
  color: #007bff;
  background: #e3f2fd;
  border-left-color: #007bff;
  font-weight: 600;
}

.sidebar-nav .nav-link.active i {
  color: #007bff;
}

.sidebar-nav .nav-content {
  padding: 0;
  margin: 0;
  list-style: none;
  background-color: #fff;
  border-left: 1px solid #e9ecef;
  margin-left: 24px;
}

.sidebar-nav .nav-content a {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 400;
  color: #6c757d;
  transition: all 0.2s ease;
  padding: 10px 0 10px 32px;
  text-decoration: none;
  border-left: 3px solid transparent;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar-nav .nav-content a i {
  font-size: 8px;
  margin-right: 10px;
  line-height: 0;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  background-color: #dee2e6;
}

.sidebar-nav .nav-content a:hover {
  color: #007bff;
  background-color: #f8f9fa;
  border-left-color: #007bff;
}

.sidebar-nav .nav-content a:hover i {
  background-color: #007bff;
}

.sidebar-nav .nav-content a.active {
  color: #007bff;
  background-color: #e3f2fd;
  border-left-color: #007bff;
  font-weight: 500;
}

.sidebar-nav .nav-content a.active i {
  background-color: #007bff;
}

/* 사이드바 토글 상태 */
body.toggle-sidebar .sidebar {
  left: -300px;
}

/* 메인 콘텐츠 토글 상태 - index.vue에서 처리됨 */

/* 반응형 디자인 */
@media (max-width: 1199px) {
  .sidebar {
    left: -280px;
  }
  
  body.sidebar-show .sidebar {
    left: 0;
  }
}

/* 모바일에서 사이드바 오버레이 */
@media (max-width: 1199px) {
  body.sidebar-show::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 995;
  }
}

/* 사이드바 토글 상태 */
body.toggle-sidebar .sidebar {
  left: -280px;
}
</style>