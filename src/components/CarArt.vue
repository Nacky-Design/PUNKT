<script setup lang="ts">
import { computed } from "vue";
import { CarFront } from "lucide-vue-next";
import { cars } from "../data";
const props = defineProps<{ index: number; name: string }>();
const photo = computed(() => cars.find(car => car.image === props.index)?.photos?.find(item => item.role === "front"));
const imageUrl = computed(() => photo.value ? `${import.meta.env.BASE_URL}assets/${photo.value.thumbnail || photo.value.file}` : "");
</script>
<template>
  <div
    class="car-art"
    :class="photo ? 'car-art--photo' : 'car-art--placeholder'"
    role="img"
    :aria-label="photo ? name : `${name} — фото готовятся`"
  >
    <img v-if="photo" :src="imageUrl" alt="" loading="lazy" decoding="async" />
    <span v-else class="car-art-placeholder" aria-hidden="true"><CarFront :size="30" /></span>
  </div>
</template>

<style scoped>
.car-art--placeholder::before { display: none; }
.car-art-placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: #737b73; }
</style>
