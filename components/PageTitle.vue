<template>
  <div class="pagetitle">
    <h1>{{ title }}</h1>
    <nav>
      <ol class="breadcrumb">
        <li 
          v-for="(crumb, index) in breadcrumbs" 
          :key="index" 
          class="breadcrumb-item"
          :class="{ active: index === breadcrumbs.length - 1 }"
        >
          <NuxtLink 
            v-if="crumb.to && index !== breadcrumbs.length - 1" 
            :to="crumb.to"
          >
            {{ crumb.text }}
          </NuxtLink>
          <span v-else>{{ crumb.text }}</span>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
interface Breadcrumb {
  text: string
  to?: string
}

interface Props {
  title: string
  breadcrumbs?: Breadcrumb[]
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumbs: () => [
    { text: 'Home', to: '/' },
    { text: 'Current Page' }
  ]
})
</script>

<style scoped>
/* 스타일은 Bootstrap과 NiceAdmin CSS에서 처리됨 */
</style>
