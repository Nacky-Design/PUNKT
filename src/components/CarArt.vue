<script setup lang="ts">
const assetBase = import.meta.env.BASE_URL + "assets/";
defineProps<{ image: number | string; name: string }>();
</script>
<template>
  <div
    v-if="typeof image === 'number'"
    class="car-art"
    role="img"
    :aria-label="name"
    :style="{
      '--car-x': `${(image % 3) * 50}%`,
      '--car-y': `${Math.floor(image / 3) * 100}%`,
      '--car-center': image < 3 ? '57%' : '53%',
    }"
  ></div>
  <img
    v-else
    class="car-art car-art-photo"
    :src="assetBase + image"
    :alt="name"
  />
</template>
