<template>
  <footer id="footer" class="footer">
    <div class="copyright">
      &copy; Copyright <strong><span>hping.co.kr</span></strong>. All Rights Reserved
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer 컴포넌트는 정적이므로 특별한 로직이 필요하지 않음
</script>

<style scoped>
/* 푸터 아이콘 제거를 위한 CSS */
.footer {
  background: #f6f9ff;
  padding: 20px 0;
  font-size: 14px;
  transition: all 0.3s;
  border-top: 1px solid #cddfff;
}

.footer .copyright {
  text-align: center;
  color: #012970;
}

/* 가상 요소로 추가된 아이콘들 제거 */
.footer::before,
.footer::after,
.footer .copyright::before,
.footer .copyright::after {
  display: none !important;
  content: none !important;
}

/* 모든 아이콘 요소 숨기기 */
.footer i,
.footer .icon,
.footer [class*="icon"],
.footer [class*="bi-"],
.footer .fa,
.footer [class*="fa-"] {
  display: none !important;
}

/* credits 섹션이 있다면 숨기기 */
.footer .credits {
  display: none !important;
}

/* 추가적인 아이콘 제거 */
.footer * {
  background-image: none !important;
}

.footer *::before,
.footer *::after {
  display: none !important;
  content: none !important;
}
</style>
