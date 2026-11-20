<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-vue-next";
import CarArt from "./CarArt.vue";
import type { Car } from "../data";

const props = defineProps<{ car: Car }>();
const slides = computed<ReadonlyArray<{ label: string; file?: string; role?: string; illustration?: boolean }>>(() =>
  props.car.photos?.length ? props.car.photos : [{ label: "Общий вид" }],
);
const secondaryIndex = computed(() => {
  return slides.value.findIndex((item, index) => index > 0 && (item.role === "rear" || /вид сзади|задний вид|сзади|rear/i.test(item.label)));
});
const current = ref(0);
const opened = ref(false);
const closeButton = ref<HTMLButtonElement>();
let returnFocus: HTMLElement | null = null;
let previousOverflow = "";
const asset = (file: string) => import.meta.env.BASE_URL + "assets/" + file;
const move = (direction: number) => {
  current.value = (current.value + direction + slides.value.length) % slides.value.length;
};
function close() {
  if (!opened.value) return;
  opened.value = false;
  document.body.style.overflow = previousOverflow;
  window.removeEventListener("keydown", keydown);
  nextTick(() => returnFocus?.focus());
}
function keydown(event: KeyboardEvent) {
  if (event.key === "Escape") { event.preventDefault(); close(); }
  else if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
  else if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  else if (event.key === "Tab") {
    const modal = document.getElementById("vehicle-photo-dialog");
    const buttons = Array.from(modal?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? []);
    if (!buttons.length) return;
    const first = buttons[0]!;
    const last = buttons[buttons.length - 1]!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}
function open(index: number) {
  current.value = index;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  opened.value = true;
  window.addEventListener("keydown", keydown);
  nextTick(() => closeButton.value?.focus());
}
onBeforeUnmount(() => {
  if (opened.value) document.body.style.overflow = previousOverflow;
  window.removeEventListener("keydown", keydown);
});
</script>

<template>
  <figure class="detail-photo" aria-label="Фотографии автомобиля">
    <div class="photo-preview" :class="{ 'single-photo': secondaryIndex < 0 }">
      <button class="preview-tile preview-main" type="button" :aria-label="`Открыть фотографию: ${slides[0]!.label}`" @click="open(0)">
        <img v-if="slides[0]!.file" :src="asset(slides[0]!.file!)" :alt="`${car.name} — ${slides[0]!.label}`" decoding="async" />
        <CarArt v-else :index="car.image" :name="car.name" />
      </button>
      <button v-if="secondaryIndex >= 0" class="preview-tile preview-secondary" type="button" :aria-label="`Открыть фотографию: ${slides[secondaryIndex]!.label}`" @click="open(secondaryIndex)">
        <img v-if="slides[secondaryIndex]!.file" :src="asset(slides[secondaryIndex]!.file!)" :alt="`${car.name} — ${slides[secondaryIndex]!.label}`" decoding="async" />
        <CarArt v-else :index="car.image" :name="car.name" />
        <span class="preview-label">{{ slides[secondaryIndex]!.label }}</span>
      </button>
      <button class="show-all" type="button" @click="open(0)"><Images :size="18" aria-hidden="true" /> {{ slides.length === 1 ? 'Показать фото' : `Все ${slides.length} фото` }}</button>
    </div>
    <figcaption v-if="car.photos?.some(photo => photo.illustration)" class="photo-disclaimer">Фотографии конкретного автомобиля уточняйте при обращении.</figcaption>
  </figure>

  <Teleport to="body">
    <div v-if="opened" class="photo-overlay" @click.self="close">
      <section id="vehicle-photo-dialog" class="photo-dialog" role="dialog" aria-modal="true" aria-labelledby="photo-dialog-title">
        <header class="photo-dialog-header">
          <div><h2 id="photo-dialog-title">{{ car.name }}</h2><p>{{ current + 1 }} / {{ slides.length }} · {{ slides[current]!.label }}</p></div>
          <button ref="closeButton" class="photo-icon photo-close" type="button" aria-label="Закрыть галерею" @click="close"><X :size="23" /></button>
        </header>
        <div class="photo-stage">
          <button v-if="slides.length > 1" class="photo-icon photo-prev" type="button" aria-label="Предыдущее фото" @click="move(-1)"><ChevronLeft :size="23" /></button>
          <div v-if="slides[current]!.file" class="photo-stage-image"><img :src="asset(slides[current]!.file!)" :alt="`${car.name} — ${slides[current]!.label}`" /></div>
          <CarArt v-else :index="car.image" :name="`${car.name} — ${slides[current]!.label}`" />
          <button v-if="slides.length > 1" class="photo-icon photo-next" type="button" aria-label="Следующее фото" @click="move(1)"><ChevronRight :size="23" /></button>
        </div>
        <div v-if="slides.length > 1" class="photo-thumbnails" role="group" aria-label="Выберите фотографию">
          <button v-for="(item, index) in slides" :key="item.label" type="button" :aria-label="item.label" :aria-pressed="index === current" @click="current = index">
            <img v-if="item.file" :src="asset(item.file)" alt="" loading="lazy" decoding="async" />
            <CarArt v-else :index="car.image" :name="car.name" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.detail-photo { min-width: 0; }
.photo-disclaimer { margin-top: 8px; color: #777; font-size: 12px; line-height: 1.4; }
.photo-preview { position: relative; display: grid; grid-template-columns: 2fr 1fr; gap: 8px; aspect-ratio: 2.55 / 1; overflow: hidden; border-radius: 14px; background: #f0f0ee; }
.preview-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px; color: #858582; background: #e8e8e5; text-align: center; font-size: 13px; line-height: 1.4; }
.preview-tile { position: relative; min-width: 0; height: 100%; padding: 0; overflow: hidden; background: #ededeb; }
.preview-tile img { display: block; width: 100%; height: 100%; object-fit: cover; background: #f0f0ee; transition: transform .25s ease; }
.preview-tile:hover img { transform: scale(1.025); }
.preview-tile :deep(.car-art) { height: 100%; aspect-ratio: auto; container-type: size; }
.preview-tile :deep(.car-art::before) { width: min(100%, calc(100cqh * 1.65)); }
.preview-label { position: absolute; top: 12px; left: 12px; padding: 6px 9px; border-radius: 7px; background: #fff; color: #333; font-size: 12px; font-weight: 600; }
.show-all { position: absolute; right: 14px; bottom: 14px; display: flex; align-items: center; gap: 8px; padding: 11px 14px; border-radius: 9px; background: white; box-shadow: 0 3px 14px #0002; color: #171717; font-size: 13px; font-weight: 650; }
.show-all:hover { background: #ffc107; }
.photo-overlay { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 24px; background: #111e; }
.photo-dialog { display: flex; flex-direction: column; width: min(1100px, 100%); height: min(900px, 100%); min-height: 0; color: white; }
.photo-dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 0 12px; }
.photo-dialog-header h2 { margin: 0; font-size: 20px; }
.photo-dialog-header p { margin: 5px 0 0; color: #ddd; font-size: 13px; }
.photo-icon { display: grid; place-items: center; flex: none; width: 42px; height: 42px; border-radius: 50%; color: #171717; background: #fff; }
.photo-icon:hover { background: #ffc107; }
.photo-stage { position: relative; display: grid; place-items: center; min-height: 0; flex: 1; overflow: hidden; border-radius: 12px; background: #222; container-type: size; }
.photo-stage-image { position: relative; display: flex; min-width: 0; min-height: 0; max-width: 100%; max-height: 100%; }
.photo-stage-image > img { display: block; width: auto; height: auto; max-width: 100cqw; max-height: 100cqh; object-fit: contain; }
.photo-stage > :deep(.car-art) { width: 100%; height: 100%; aspect-ratio: auto; background: #f0f0ee; container-type: size; }
.photo-stage > :deep(.car-art::before) { width: min(100%, calc(100cqh * 1.65)); }
.photo-prev, .photo-next { position: absolute; top: 50%; z-index: 1; transform: translateY(-50%); }
.photo-prev { left: 14px; } .photo-next { right: 14px; }
.photo-thumbnails { display: flex; justify-content: flex-start; justify-content: safe center; gap: 8px; padding-top: 12px; overflow-x: auto; }
.photo-thumbnails button { flex: 0 0 80px; height: 54px; padding: 0; overflow: hidden; border: 2px solid transparent; border-radius: 7px; opacity: .7; background: #eee; }
.photo-thumbnails button[aria-pressed="true"] { border-color: #ffc107; opacity: 1; }
.photo-thumbnails img { width: 100%; height: 100%; object-fit: cover; }
@media (max-width: 650px) {
  .photo-preview { grid-template-columns: 1fr 1fr; gap: 5px; aspect-ratio: 2.4 / 1; border-radius: 11px; }
  .preview-label { top: 8px; left: 8px; font-size: 10px; padding: 5px 6px; }
  .show-all { right: 8px; bottom: 8px; padding: 9px 10px; font-size: 12px; }
  .photo-overlay { padding: 16px; }
  .photo-dialog { height: 100%; }
  .photo-icon { width: 38px; height: 38px; }
  .photo-prev { left: 8px; } .photo-next { right: 8px; }
}
@media (max-width: 400px) { .preview-placeholder { padding: 8px 5px 46px; gap: 5px; font-size: 11px; } }
@media (prefers-reduced-motion: reduce) { .preview-tile img { transition: none; } }
.photo-preview.single-photo { grid-template-columns: minmax(0, 1fr); }
</style>
