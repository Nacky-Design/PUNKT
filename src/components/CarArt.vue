<script setup lang="ts">
import { computed } from "vue";
import { cars } from "../data";
const props = defineProps<{ index: number; name: string }>();
const photo = computed(() => cars.find(car => car.image === props.index)?.photos?.find(item => item.role === "front"));
const imageUrl = computed(() => photo.value ? `${import.meta.env.BASE_URL}assets/${photo.value.thumbnail || photo.value.file}` : "");
</script>
<template>
  <div
    class="car-art"
    :class="{ 'car-art--photo': photo }"
    role="img"
    :aria-label="name"
    :style="{
      '--car-x': `${(index % 3) * 50}%`,
      '--car-y': `${Math.floor(index / 3) * 100}%`,
      '--car-center': index < 3 ? '57%' : '53%',
    }"
  >
    <img v-if="photo" :src="imageUrl" alt="" loading="lazy" decoding="async" />
  </div>
</template>
