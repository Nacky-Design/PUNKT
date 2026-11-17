<script setup lang="ts">
defineProps<{ index: number; name: string }>();
</script>
<template>
  <div
    class="car-art"
    role="img"
    :aria-label="name"
    :style="{
      '--car-x': `${(index % 3) * 50}%`,
      '--car-y': `${Math.floor(index / 3) * 100}%`,
      '--car-center': index < 3 ? '57%' : '53%',
    }"
  ></div>
</template>
