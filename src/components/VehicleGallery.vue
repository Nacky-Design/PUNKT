<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import CarArt from "./CarArt.vue";
import type { Car, CarPhoto } from "../data";

const props = defineProps<{ car: Car }>();
const photoOrder: Record<NonNullable<CarPhoto["role"]>, number> = {
  front: 0,
  exterior: 1,
  rear: 1,
  other: 1,
  interior: 2,
  trunk: 3,
};
const photos = computed(() => [...(props.car.photos ?? [])].sort(
  (left, right) => photoOrder[left.role ?? "other"] - photoOrder[right.role ?? "other"],
));
const current = ref(0);
const active = computed(() => photos.value[current.value]);
const thumbnails = ref<HTMLDivElement>();
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;
let touchStart: Touch | undefined;

watch(current, index => {
  const list = thumbnails.value;
  const button = list?.children.item(index);
  if (!list || !(button instanceof HTMLElement)) return;
  list.scrollTo({
    left: Math.min(button.offsetLeft, Math.max(list.scrollLeft, button.offsetLeft + button.offsetWidth - list.clientWidth)),
    top: Math.min(button.offsetTop, Math.max(list.scrollTop, button.offsetTop + button.offsetHeight - list.clientHeight)),
  });
}, { flush: "post" });

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
  <figure class="detail-photo" :class="{ 'detail-photo--with-previews': photos.length > 1, 'detail-photo--preview-grid': photos.length >= 4 }"
    aria-label="Фотографии автомобиля"
    @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
    <div class="gallery-stage" @touchstart.passive="startSwipe" @touchend.passive="endSwipe" @touchcancel="touchStart = undefined">
      <img v-if="active" :src="asset(active.file)" :alt="`${car.name} — ${active.label}`"
        :style="{ objectPosition: `center ${active.verticalPosition ?? 50}%` }" decoding="async" />
      <CarArt v-else :index="car.image" :name="car.name" />
      <template v-if="photos.length > 1">
        <button class="gallery-arrow previous" type="button" aria-label="Предыдущее фото" @click="move(-1)"><ChevronLeft :size="24" aria-hidden="true" /></button>
        <button class="gallery-arrow next" type="button" aria-label="Следующее фото" @click="move(1)"><ChevronRight :size="24" aria-hidden="true" /></button>
      </template>
    </div>
    <div v-if="photos.length > 1" class="gallery-rail" :style="{ '--preview-rows': Math.min(photos.length, 3) }">
      <div ref="thumbnails" class="gallery-thumbnails" role="group" aria-label="Выберите фотографию">
        <button v-for="(photo, index) in photos" :key="photo.file" type="button" :aria-label="photo.label" :aria-pressed="index === current" @click="current = index">
          <img :src="asset(photo.thumbnail ?? photo.file)" alt="" loading="lazy" decoding="async"
            :style="{ objectPosition: `${photo.thumbnailHorizontalPosition ?? 50}% center` }" />
        </button>
      </div>
    </div>
    <span v-if="photos.length > 1" class="sr-only" role="status">{{ current + 1 }} из {{ photos.length }}. {{ active?.label }}</span>
  </figure>
</template>

<style scoped>
.detail-photo { --gallery-gap: 10px; min-width: 0; margin: 0; }
.gallery-stage { position: relative; width: 100%; aspect-ratio: 16 / 9; max-height: 510px; overflow: hidden; border-radius: 14px; background: #edefeb; touch-action: pan-y pinch-zoom; }
.gallery-stage > img, .gallery-stage :deep(.car-art) { display: block; width: 100%; height: 100%; object-fit: cover; }
.gallery-arrow { position: absolute; top: 50%; display: grid; place-items: center; width: 44px; height: 44px; padding: 0; transform: translateY(-50%); border: 1px solid #d8dbd6; border-radius: 50%; background: #fff; }
.gallery-arrow:hover { background: #f3f4f0; }
.gallery-arrow.previous { left: 14px; }
.gallery-arrow.next { right: 14px; }
.gallery-rail { position: relative; min-width: 0; margin-top: var(--gallery-gap); }
.gallery-thumbnails { position: relative; display: flex; gap: var(--gallery-gap); overflow-x: auto; }
.gallery-thumbnails button { position: relative; flex: 0 0 86px; min-height: 0; aspect-ratio: 16 / 10; overflow: hidden; padding: 0; border-radius: 9px; background: #edefeb; }
.gallery-thumbnails button[aria-pressed="true"]::after { content: ""; position: absolute; inset: 0; border: 2px solid #69746d; box-shadow: inset 0 0 0 1px #fff; border-radius: inherit; pointer-events: none; }
.gallery-thumbnails button:focus-visible { outline-offset: -5px; }
.gallery-thumbnails img { display: block; width: 100%; height: 100%; object-fit: cover; }
@media (min-width: 761px) {
  .detail-photo--with-previews { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--gallery-gap); }
  .gallery-rail { margin-top: 0; }
  .gallery-thumbnails {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: calc((100% - (var(--preview-rows) - 1) * var(--gallery-gap)) / var(--preview-rows));
    overflow: hidden auto;
    scrollbar-width: thin;
  }
  .gallery-thumbnails button { aspect-ratio: auto; }
  .detail-photo--preview-grid { grid-template-columns: minmax(0, 16fr) minmax(0, 9fr); }
  .detail-photo--preview-grid .gallery-thumbnails {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: calc((100% - var(--gallery-gap)) / 2);
  }
  .detail-photo--preview-grid .gallery-thumbnails button { align-self: start; width: 100%; aspect-ratio: 1; }
}
@media (max-width: 650px) {
  .gallery-arrow.previous { left: 8px; }
  .gallery-arrow.next { right: 8px; }
}
</style>
