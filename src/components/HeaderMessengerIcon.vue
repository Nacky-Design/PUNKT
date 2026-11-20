<script setup lang="ts">
defineProps<{ kind: 'telegram' | 'whatsapp' | 'max' }>();
</script>
<template>
  <svg v-if="kind === 'telegram'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m21.5 3-3.2 17.3-5.4-4-3 3 .5-4.7-7.9-2.8L21.5 3Z" />
    <path d="m10.4 14.6 7-6" />
  </svg>
  <svg v-else-if="kind === 'whatsapp'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.4 11.7a8.4 8.4 0 0 1-12.6 7.2L3.5 20l1.1-4.2a8.4 8.4 0 1 1 15.8-4.1Z" />
    <path d="M9 8.4c.3-.4.6-.5 1-.1l1 1.5c.2.3.1.5-.2.9l-.5.5c.7 1.3 1.7 2.2 3 2.9l.6-.5c.3-.3.6-.3.9-.1l1.4.9c.4.2.4.6.1 1-1.2 1.7-3.7.4-5.5-1.4C9 12.2 7.8 9.7 9 8.4Z" />
  </svg>
  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.5 11.8c0 4.8-3.4 8.2-8.5 8.2-1.4 0-2.7-.3-3.8-.9l-3.7 1.4.8-3.7a8.2 8.2 0 0 1-1.6-5c0-4.8 3.4-8.1 8.3-8.1 5.1 0 8.5 3.3 8.5 8.1Z" />
    <path d="M8.5 12c0-2.1 1.4-3.5 3.5-3.5s3.5 1.4 3.5 3.5-1.4 3.5-3.5 3.5S8.5 14.1 8.5 12Z" />
  </svg>
</template>
<style scoped>svg{display:block;width:100%;height:100%}</style>
