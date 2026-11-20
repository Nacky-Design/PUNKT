<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import CarArt from "./CarArt.vue";
import type { Car } from "../data";

const props = defineProps<{ car: Car }>();
const photos = computed(() => props.car.photos ?? []);
const current = ref(0);
const active = computed(() => photos.value[current.value]);
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;
let touchStart: Touch | undefined;

function move(direction: number) {
  const count = photos.value.length;
  if (count > 1) current.value = (current.value + direction + count) % count;
}

function startSwipe(event: TouchEvent) {
  touchStart = event.touches.length === 1 ? event.touches[0] : undefined;
}

function endSwipe(event: TouchEvent) {
  const start = touchStart;
  const end = event.changedTouches[0];
  touchStart = undefined;
  if (!start || !end || start.identifier !== end.identifier) return;

  const dx = end.clientX - start.clientX;
  const dy = end.clientY - start.clientY;
  if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
}
</script>

<template>
  <figure class="detail-photo" aria-label="Фотографии автомобиля"
    @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
    <div class="gallery-stage" @touchstart.passive="startSwipe" @touchend.passive="endSwipe" @touchcancel="touchStart = undefined">
      <img v-if="active" :src="asset(active.file)" :alt="`${car.name} — ${active.label}`" decoding="async" />
      <CarArt v-else :index="car.image" :name="car.name" />
      <template v-if="photos.length > 1">
        <button class="gallery-arrow previous" type="button" aria-label="Предыдущее фото" @click="move(-1)"><ChevronLeft :size="24" aria-hidden="true" /></button>
        <button class="gallery-arrow next" type="button" aria-label="Следующее фото" @click="move(1)"><ChevronRight :size="24" aria-hidden="true" /></button>
      </template>
    </div>
    <div v-if="photos.length > 1" class="gallery-thumbnails" role="group" aria-label="Выберите фотографию">
      <button v-for="(photo, index) in photos" :key="photo.file" type="button" :aria-label="photo.label" :aria-pressed="index === current" @click="current = index">
        <img :src="asset(photo.thumbnail ?? photo.file)" alt="" loading="lazy" decoding="async" />
      </button>
    </div>
    <span v-if="photos.length > 1" class="sr-only" role="status">{{ current + 1 }} из {{ photos.length }}. {{ active?.label }}</span>
  </figure>
</template>

<style scoped>
.detail-photo { min-width: 0; margin: 0; }
.gallery-stage { position: relative; width: 100%; height: clamp(228px, 37vw, 510px); border-radius: 14px; background: #edefeb; touch-action: pan-y pinch-zoom; }
.gallery-stage > img, .gallery-stage :deep(.car-art) { display: block; width: 100%; height: 100%; border-radius: inherit; object-fit: contain; }
.gallery-arrow { position: absolute; top: 50%; display: grid; place-items: center; width: 44px; height: 44px; padding: 0; transform: translateY(-50%); border: 1px solid #d8dbd6; border-radius: 50%; background: #fff; }
.gallery-arrow:hover { background: #f3f4f0; }
.gallery-arrow.previous { left: 14px; }
.gallery-arrow.next { right: 14px; }
.gallery-thumbnails { display: flex; gap: 9px; overflow-x: auto; margin: 8px 0 0; padding: 4px; }
.gallery-thumbnails button { flex: 0 0 92px; aspect-ratio: 3 / 2; overflow: hidden; padding: 0; border: 2px solid transparent; border-radius: 9px; background: #edefeb; }
.gallery-thumbnails button[aria-pressed="true"] { border-color: #636963; }
.gallery-thumbnails img { display: block; width: 100%; height: 100%; object-fit: cover; }
@media (max-width: 650px) {
  .gallery-stage { height: auto; aspect-ratio: 3 / 2; }
  .gallery-arrow.previous { left: 8px; }
  .gallery-arrow.next { right: 8px; }
  .gallery-thumbnails button { flex-basis: 72px; }
}
</style>
