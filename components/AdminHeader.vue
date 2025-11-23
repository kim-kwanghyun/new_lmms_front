<template>
  <header id="header" class="header fixed-top d-flex align-items-center">
    <div class="d-flex align-items-center justify-content-between">
      <NuxtLink to="/" class="logo d-flex align-items-center">                
        <img src="/assets/images/logo_black.png" alt="AI-LSMMS Logo" class="logo-image" />
        <span class="d-none d-lg-block">AI-LSMMS</span>
      </NuxtLink>
        </div>
  

    <!-- Header Navigation -->
    <nav class="header-nav ms-auto">
      <ul class="d-flex align-items-center">
        <!-- Mobile Search Icon -->
        <li class="nav-item d-block d-lg-none">
          <a class="nav-link nav-icon search-bar-toggle" href="#" @click.prevent="toggleMobileSearch">
          
          </a>
        </li>

        <!-- Profile -->
        <li class="nav-item dropdown pe-3">
          <a class="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
           
            <span class="d-none d-md-block dropdown-toggle ps-2">{{ user.name }}</span>
          </a>

          <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
            <li class="dropdown-header">
              <h6>{{ user.name }}</h6>
              <span>{{ user.role }}</span>
            </li>
            <li><hr class="dropdown-divider"></li>

            <li>
              <!-- <NuxtLink to="/profile" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-person"></i>
                <span>My Profile</span>
              </NuxtLink> -->
              <span class="dropdown-item d-flex align-items-center text-muted">
                <i class="bi bi-person"></i>
                <span>My Profile</span>
              </span>
            </li>
            <li><hr class="dropdown-divider"></li>

            <li>
              <!-- <NuxtLink to="/settings" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-gear"></i>
                <span>Account Settings</span>
              </NuxtLink> -->
              <span class="dropdown-item d-flex align-items-center text-muted">
                <i class="bi bi-gear"></i>
                <span>Account Settings</span>
              </span>
            </li>
            <li><hr class="dropdown-divider"></li>

            <li>
              <!-- <NuxtLink to="/faq" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-question-circle"></i>
                <span>Need Help?</span>
              </NuxtLink> -->             
            </li>
            <li><hr class="dropdown-divider"></li>

            <li>
              <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="handleSignOut">
                <i class="bi bi-box-arrow-right"></i>
                <span>Sign Out</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Notification {
  id: number
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  createdAt: string
}

interface Message {
  id: number
  sender: string
  content: string
  avatar: string
  createdAt: string
}

interface User {
  name: string
  role: string
  avatar: string
}

// 반응형 데이터
const searchQuery = ref('')

// 더미 데이터 (실제로는 API에서 가져옴)
const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'warning',
    title: 'Lorem Ipsum',
    message: 'Quae dolorem earum veritatis oditseno',
    createdAt: '30 min. ago'
  },
  {
    id: 2,
    type: 'danger',
    title: 'Atque rerum nesciunt',
    message: 'Quae dolorem earum veritatis oditseno',
    createdAt: '1 hr. ago'
  },
  {
    id: 3,
    type: 'success',
    title: 'Sit rerum fuga',
    message: 'Quae dolorem earum veritatis oditseno',
    createdAt: '2 hrs. ago'
  },
  {
    id: 4,
    type: 'info',
    title: 'Dicta reprehenderit',
    message: 'Quae dolorem earum veritatis oditseno',
    createdAt: '4 hrs. ago'
  }
])

const messages = ref<Message[]>([
  {
    id: 1,
    sender: 'Maria Hudson',
    content: 'Velit asperiores et ducimus soluta repudiandae labore officia est ut...',
    avatar: '/assets/img/messages-1.jpg',
    createdAt: '4 hrs. ago'
  },
  {
    id: 2,
    sender: 'Anna Nelson',
    content: 'Velit asperiores et ducimus soluta repudiandae labore officia est ut...',
    avatar: '/assets/img/messages-2.jpg',
    createdAt: '6 hrs. ago'
  },
  {
    id: 3,
    sender: 'David Muldon',
    content: 'Velit asperiores et ducimus soluta repudiandae labore officia est ut...',
    avatar: '/assets/img/messages-3.jpg',
    createdAt: '8 hrs. ago'
  }
])

// Auth - 사용자 정보
const currentUser = ref<any>(null)
const user = computed(() => ({
  name: currentUser.value?.member_name || 'K. Anderson',
  role: currentUser.value?.member_gubun === '1' ? '관리자' : '사용자',
  avatar: currentUser.value?.member_pic || ''
}))

// 로그인된 사용자 정보 로드
onMounted(async () => {
  try {
    // 전역 상태에서 사용자 정보 가져오기
    const response = await fetch('/api/member/verify', {
      method: 'GET',
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.retcode === 'success') {
        currentUser.value = data.data
      }
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
  }
})

// 메서드
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 검색 로직 구현 (검색 페이지가 없으므로 콘솔 로그로 대체)
    console.log('검색어:', searchQuery.value)
    // navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const toggleMobileSearch = () => {
  // 모바일 검색 토글 로직
  console.log('Toggle mobile search')
}

const getNotificationIcon = (type: string) => {
  const icons = {
    warning: 'bi bi-exclamation-circle text-warning',
    danger: 'bi bi-x-circle text-danger',
    success: 'bi bi-check-circle text-success',
    info: 'bi bi-info-circle text-primary'
  }
  return icons[type as keyof typeof icons] || icons.info
}

const formatTime = (time: string) => {
  // 실제로는 날짜 라이브러리를 사용
  return time
}

const handleSignOut = async () => {
  // 로그아웃 로직
  if (confirm('정말 로그아웃하시겠습니까?')) {
    try {
      await fetch('/api/member/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      currentUser.value = null
      window.location.href = '/member/login'
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
    }
  }
}

// 사이드바 토글 기능
const toggleSidebar = () => {
  if (typeof window !== 'undefined') {
    const body = document.body
    
    // 데스크톱: toggle-sidebar 클래스 사용
    if (window.innerWidth >= 1200) {
      body.classList.toggle('toggle-sidebar')
    } else {
      // 모바일: sidebar-show 클래스 사용
      body.classList.toggle('sidebar-show')
    }
    
    // 토글 버튼 아이콘 변경
    const sidebarToggle = document.querySelector('.toggle-sidebar-btn')
    if (sidebarToggle) {
      const icon = sidebarToggle.querySelector('i')
      if (icon) {
        const isHidden = body.classList.contains('toggle-sidebar') || 
                        (window.innerWidth < 1200 && !body.classList.contains('sidebar-show'))
        
        if (isHidden) {
          icon.classList.remove('bi-list')
          icon.classList.add('bi-x')
        } else {
          icon.classList.remove('bi-x')
          icon.classList.add('bi-list')
        }
      }
    }
  }
}
</script>

<style scoped>
/* 헤더 기본 스타일 */
.header {
  height: 60px;
  background-color: #2c3e50;
  border-bottom: 1px solid #34495e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding: 0 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 로고 이미지 스타일 */
.logo-image {
  height: 36px;
  width: auto;
  margin-right: 12px;
  object-fit: contain;
}

.logo {
  height: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo span {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 헤더 네비게이션 */
.header-nav {
  height: 100%;
}

.header-nav ul {
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.header-nav .nav-item {
  height: 100%;
  display: flex;
  align-items: center;
}

.header-nav .nav-link {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 100%;
  color: #ecf0f1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: 0 4px;
}

.header-nav .nav-link:hover {
  color: #ffffff;
  background-color: #34495e;
}

.header-nav .nav-link i {
  font-size: 18px;
  margin-right: 8px;
}

/* 프로필 드롭다운 */
.nav-profile {
  padding: 0 12px !important;
  border-radius: 6px;
}

.nav-profile:hover {
  background-color: #34495e !important;
}

.nav-profile span {
  font-size: 14px;
  font-weight: 500;
  color: #ecf0f1;
}

/* 드롭다운 메뉴 */
.dropdown-menu {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  margin-top: 8px;
}

.dropdown-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.dropdown-item i {
  margin-right: 10px;
  width: 16px;
  text-align: center;
}

.dropdown-header {
  padding: 12px 20px 8px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 8px;
}

.dropdown-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.dropdown-header span {
  font-size: 12px;
  color: #6c757d;
}

/* 반응형 로고 크기 조정 */
@media (max-width: 768px) {
  .logo-image {
    height: 32px;
    margin-right: 8px;
  }
  
  .logo span {
    font-size: 16px;
  }
  
  .header {
    padding: 0 16px;
  }
}

@media (max-width: 576px) {
  .logo-image {
    height: 28px;
    margin-right: 6px;
  }
  
  .logo span {
    font-size: 14px;
  }
  
  .header {
    padding: 0 12px;
  }
}

/* 로고 호버 효과 */
.logo:hover .logo-image {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.logo:hover span {
  color: #3498db;
  transition: color 0.3s ease;
}
</style>
