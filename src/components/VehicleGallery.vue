<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import CarArt from "./CarArt.vue";
import type { Car } from "../data";

const props = defineProps<{ car: Car }>();
const views: { label: string; file?: string }[] = [
  { label: "Общий вид" },
  { label: "Передняя часть" },
  { label: "Детали кузова" },
];
const slides = computed<ReadonlyArray<{ label: string; file?: string }>>(
  () => props.car.photos?.length ? props.car.photos : views,
);
const current = ref(0);
const slide = computed(() => slides.value[current.value]!);
const asset = (file: string) => import.meta.env.BASE_URL + "assets/" + file;

function move(direction: number) {
  const count = slides.value.length;
  current.value = (current.value + direction + count) % count;
}
</script>

<template>
  <figure class="detail-photo" aria-label="Галерея автомобиля">
    <div class="detail-photo-frame" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
      <img v-if="slide.file" class="gallery-image" :src="asset(slide.file)" :alt="car.name + ' — ' + slide.label" />
      <CarArt
        v-else
        :image="car.image"
        :name="car.name + ' — ' + slide.label"
        :class="'vehicle-view-' + current"
      />
      <div class="vehicle-gallery-controls">
        <button class="icon-button" type="button" aria-label="Предыдущее фото автомобиля" @click="move(-1)">
          <ChevronLeft :size="20" aria-hidden="true" />
        </button>
        <button class="icon-button" type="button" aria-label="Следующее фото автомобиля" @click="move(1)">
          <ChevronRight :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>
    <div class="vehicle-thumbnails" role="group" aria-label="Ракурсы автомобиля">
      <button
        v-for="(item, index) in slides"
        :key="item.label"
        type="button"
        :aria-pressed="index === current"
        :aria-label="item.label"
        @click="current = index"
      >
        <img v-if="item.file" :src="asset(item.file)" alt="" loading="lazy" />
        <CarArt v-else :image="car.image" :name="car.name" :class="'vehicle-view-' + index" aria-hidden="true" />
      </button>
    </div>
  </figure>
</template>
