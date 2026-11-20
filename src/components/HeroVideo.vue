<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Pause, Play } from "lucide-vue-next";

const props = defineProps<{ banner?: boolean }>();
const logoAsset = `${import.meta.env.BASE_URL}assets/logo-source.webp`;
const mobileQuery = window.matchMedia("(max-width: 760px)");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobile = ref(mobileQuery.matches);
const wantsPlayback = ref(!motionQuery.matches);
const loadVideo = ref(wantsPlayback.value);
const playing = ref(false);
const video = ref<HTMLVideoElement>();
const peopleScene = ref(false);
const arrivalScene = ref(false);

const asset = computed(
  () => `${import.meta.env.BASE_URL}assets/${props.banner ? "hero-wan-hd" : `hero-delivery${mobile.value ? "-mobile" : ""}`}`,
);
const videoSource = computed(() =>
  `${asset.value}${props.banner ? (mobile.value ? "-mobile" : "-optimized") : ""}.mp4?v=10`,
);
let playRequest = 0;

function updateScene() {
  if (!props.banner || !video.value) return;
  const time = video.value.currentTime;
  peopleScene.value = time >= 4.8 && time < 10;
  arrivalScene.value = time >= 0.5 && time < 3.2;
}

function updateViewport(event: MediaQueryListEvent) {
  mobile.value = event.matches;
}

function stopForReducedMotion(event: MediaQueryListEvent) {
  if (event.matches) {
    wantsPlayback.value = false;
    playRequest++;
    video.value?.pause();
  }
}

function startPlayback() {
  const element = video.value;
  if (!element) return;
  wantsPlayback.value = true;
  loadVideo.value = true;
  // Set the source and play synchronously in a click handler, preserving the
  // user gesture required by mobile browsers when autoplay is unavailable.
  if (!element.getAttribute("src")) element.src = videoSource.value;
  if (element.error) element.load();
  element.muted = true;
  const request = ++playRequest;
  element.play().catch((error: DOMException) => {
    if (request === playRequest && error.name !== "AbortError") {
      wantsPlayback.value = false;
      playing.value = false;
    }
  });
}

function togglePlayback() {
  if (playing.value) {
    wantsPlayback.value = false;
    playRequest++;
    video.value?.pause();
  } else {
    startPlayback();
  }
}

watch(videoSource, () => {
  playing.value = false;
  if (wantsPlayback.value) startPlayback();
}, { flush: "post" });

onMounted(() => {
  mobileQuery.addEventListener("change", updateViewport);
  motionQuery.addEventListener("change", stopForReducedMotion);
  if (wantsPlayback.value) startPlayback();
});

onBeforeUnmount(() => {
  playRequest++;
  mobileQuery.removeEventListener("change", updateViewport);
  motionQuery.removeEventListener("change", stopForReducedMotion);
});
</script>

<template>
  <div class="hero-visual" aria-hidden="true" :style="{ backgroundImage: `url('${asset}.webp')` }">
    <video
      ref="video"
      :src="loadVideo ? videoSource : undefined"
      :poster="asset + '.webp'"
      :class="{ 'hero-video-people': banner && peopleScene }"
      :autoplay="wantsPlayback"
      muted
      loop
      playsinline
      preload="metadata"
      @playing="playing = true"
      @pause="playing = false"
      @emptied="playing = false"
      @error="playing = false; wantsPlayback = false"
      @timeupdate="updateScene"
      @seeked="updateScene"
      @loadedmetadata="updateScene"
    />
  </div>
  <div v-if="banner" class="arrival-logo" :class="{ 'arrival-logo-visible': arrivalScene }" aria-hidden="true">
    <span :style="{ backgroundImage: `url('${logoAsset}')` }"></span>
  </div>
  <button
    type="button"
    class="hero-playback"
    :aria-label="playing ? 'Приостановить фоновое видео' : 'Воспроизвести фоновое видео'"
    @click="togglePlayback"
  >
    <Pause v-if="playing" :size="16" aria-hidden="true" />
    <Play v-else :size="16" aria-hidden="true" />
  </button>
</template>
