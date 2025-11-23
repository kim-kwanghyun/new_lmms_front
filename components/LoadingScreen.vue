<template>
  <div class="loading-screen">
    <div class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩 중...</span>
        </div>
      </div>
      <div class="loading-text">
        <h4>시스템을 준비하고 있습니다...</h4>
        <p class="text-muted">잠시만 기다려주세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 로딩 화면 컴포넌트
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.loading-text h4 {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.loading-text p {
  margin: 0;
  opacity: 0.8;
}

/* 애니메이션 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-container {
  animation: fadeIn 0.5s ease-out;
}
</style>







