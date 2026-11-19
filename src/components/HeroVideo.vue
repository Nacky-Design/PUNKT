<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Pause, Play } from "lucide-vue-next";

const mobileQuery = window.matchMedia("(max-width: 760px)");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobile = ref(mobileQuery.matches);
const wantsPlayback = ref(!mobile.value && !motionQuery.matches);
const loadVideo = ref(wantsPlayback.value);
const playing = ref(false);
const video = ref<HTMLVideoElement>();

const asset = computed(
  () => `${import.meta.env.BASE_URL}assets/hero-delivery${mobile.value ? "-mobile" : ""}`,
);

function updateViewport(event: MediaQueryListEvent) {
  mobile.value = event.matches;
  wantsPlayback.value = !event.matches && !motionQuery.matches;
  loadVideo.value = wantsPlayback.value;
}

function stopForReducedMotion(event: MediaQueryListEvent) {
  if (event.matches) wantsPlayback.value = false;
}

function applyPlayback() {
  const element = video.value;
  if (!element) return;
  if (wantsPlayback.value) {
    element.play().catch((error: DOMException) => {
      if (error.name !== "AbortError") wantsPlayback.value = false;
    });
  } else {
    element.pause();
  }
}

function togglePlayback() {
  if (!wantsPlayback.value) loadVideo.value = true;
  if (video.value?.error) video.value.load();
  wantsPlayback.value = !wantsPlayback.value;
}

watch([wantsPlayback, asset], applyPlayback, { flush: "post" });

onMounted(() => {
  mobileQuery.addEventListener("change", updateViewport);
  motionQuery.addEventListener("change", stopForReducedMotion);
  applyPlayback();
});

onBeforeUnmount(() => {
  mobileQuery.removeEventListener("change", updateViewport);
  motionQuery.removeEventListener("change", stopForReducedMotion);
});
</script>

<template>
  <div
    class="hero-visual"
    :class="{ 'hero-still': mobile && !playing }"
    aria-hidden="true"
    :style="{ backgroundImage: `url('${asset}.webp')` }"
  >
    <video
      ref="video"
      :src="loadVideo ? asset + (mobile ? '.mp4?v=13' : '.mp4?v=08') : undefined"
      :poster="asset + '.webp'"
      muted
      loop
      playsinline
      preload="none"
      @playing="playing = true"
      @pause="playing = false"
      @emptied="playing = false"
      @error="playing = wantsPlayback = false"
    />
  </div>
  <button
    type="button"
    class="hero-playback"
    :aria-label="wantsPlayback ? 'Приостановить фоновое видео' : 'Воспроизвести фоновое видео'"
    @click="togglePlayback"
  >
    <Pause v-if="playing" :size="16" aria-hidden="true" />
    <Play v-else :size="16" aria-hidden="true" />
  </button>
</template>
