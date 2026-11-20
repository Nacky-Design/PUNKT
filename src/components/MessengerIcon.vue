<script setup lang="ts">
defineProps<{ kind: 'telegram' | 'max' }>();
</script>
<template>
  <svg v-if="kind === 'telegram'" viewBox="0 0 32 32" aria-hidden="true" class="messenger-icon">
    <circle cx="16" cy="16" r="16" fill="#338cc4" />
    <path fill="#fff" d="M25.2 8.7 22 24c-.2 1.1-.9 1.4-1.8.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5l18.3-7.1c.9-.3 1.7.2 1.6.9Z" />
  </svg>
  <svg v-else viewBox="0 0 32 32" aria-hidden="true" class="messenger-icon">
    <defs><linearGradient id="max-logo-gradient" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#27d7f4"/><stop offset=".55" stop-color="#2358f5"/><stop offset="1" stop-color="#8d2ae6"/></linearGradient></defs>
    <rect width="32" height="32" rx="9" fill="url(#max-logo-gradient)" />
    <path fill="#fff" d="M16.1 6.5c-5.7 0-9.6 4-9.6 9.5 0 2 .6 3.8 1.5 5.3l-.8 3.7c-.1.6.3.9.8.6l3.6-1.4c1.3.7 2.8 1 4.5 1 5.6 0 9.4-3.9 9.4-9.3 0-5.5-3.8-9.4-9.4-9.4Zm-.1 5c2.6 0 4.3 1.8 4.3 4.4 0 2.7-1.7 4.5-4.3 4.5-2.6 0-4.4-1.8-4.4-4.5 0-2.6 1.8-4.4 4.4-4.4Z" />
  </svg>
</template>
<style scoped>.messenger-icon{display:block;width:100%;height:100%}</style>
