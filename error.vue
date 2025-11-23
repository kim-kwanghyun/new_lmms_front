<template>
  <div class="error-page">
    <div class="error-container">
      <h1>{{ error.statusCode }}</h1>
      <p>{{ error.statusMessage }}</p>
      <div class="error-actions">
        <button @click="handleError" class="btn btn-primary">
          홈으로 돌아가기
        </button>
        <button @click="refresh" class="btn btn-secondary">
          새로고침
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['error'])

const handleError = async () => {
  await clearError({ redirect: '/' })
}

const refresh = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.error-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.error-container h1 {
  font-size: 4rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-container p {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
</style>


