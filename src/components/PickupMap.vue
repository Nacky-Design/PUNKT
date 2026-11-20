<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { LocateFixed } from "lucide-vue-next";
import { control, divIcon, map, marker, tileLayer, type Map, type Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DeliveryPoint } from "../delivery";

const props = defineProps<{ point?: DeliveryPoint }>();
const emit = defineEmits<{ select: [point: DeliveryPoint] }>();
const canvas = ref<HTMLElement>();
const tilesReady = ref(false);
const tilesFailed = ref(false);
let pickupMap: Map | undefined;
let pin: Marker | undefined;
const pinStyle = divIcon({ className: "pickup-map-marker", iconSize: [20, 20], iconAnchor: [10, 10] });

function mark(point: DeliveryPoint) {
  if (!pickupMap) return;
  if (!pin) pin = marker(point, { icon: pinStyle, keyboard: false, interactive: false }).addTo(pickupMap);
  else pin.setLatLng(point);
}
function select(point: DeliveryPoint) {
  if (!tilesReady.value) return;
  mark(point);
  emit("select", point);
}
function selectCenter() {
  if (pickupMap) select(pickupMap.getCenter());
}

onMounted(() => {
  if (!canvas.value) return;
  pickupMap = map(canvas.value, { zoomControl: false, scrollWheelZoom: false })
    .setView(props.point ?? [55.756, 37.621], props.point ? 17 : 12);
  pickupMap.attributionControl.setPrefix(false);
  control.zoom({ zoomInTitle: "Приблизить", zoomOutTitle: "Отдалить" }).addTo(pickupMap);
  const tiles = tileLayer(import.meta.env.VITE_PICKUP_TILES_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  });
  tiles.on("tileload", () => {
    if (tilesReady.value) return;
    tilesReady.value = true;
    if (tilesFailed.value) nextTick(() => pickupMap?.invalidateSize());
  });
  tiles.on("tileerror", () => { tilesFailed.value = true; });
  tiles.addTo(pickupMap);
  pickupMap.on("click", event => select(event.latlng));
  if (props.point) mark(props.point);
});
onBeforeUnmount(() => pickupMap?.remove());
</script>

<template>
  <div class="pickup-map">
    <p v-if="!tilesFailed || tilesReady" class="pickup-map-instruction">Поставьте метку в месте подачи и проверьте адрес.</p>
    <div v-show="!tilesFailed || tilesReady" class="pickup-map-frame">
      <div ref="canvas" class="pickup-map-canvas" role="region" aria-label="Карта Москвы" />
      <p v-if="!tilesReady" class="pickup-map-status" role="status">Загружаем карту…</p>
    </div>
    <p v-if="tilesFailed && !tilesReady" class="pickup-map-warning" role="status">Карта недоступна. Укажите адрес ниже.</p>
    <button v-if="tilesReady" type="button" class="button button-soft" @click="selectCenter"><LocateFixed :size="17" aria-hidden="true" /> Выбрать центр карты</button>
  </div>
</template>

<style scoped>
.pickup-map { display: grid; gap: 9px; }
.pickup-map-frame { position: relative; min-width: 0; border-radius: 12px; overflow: hidden; isolation: isolate; }
.pickup-map-canvas { height: clamp(220px, 43dvh, 430px); background: #e9ede7; }
.pickup-map-canvas:focus-visible { outline-offset: -3px; }
.pickup-map :deep(.pickup-map-marker) { border: 3px solid #262722; border-radius: 50%; background: #ffc107; box-shadow: 0 0 0 3px #fff, 0 4px 12px #0004; }
.pickup-map-status { position: absolute; z-index: 500; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: calc(100% - 26px); width: max-content; padding: 10px 14px; border-radius: 8px; background: #fff; color: #343833; font-size: var(--type-secondary); text-align: center; }
.pickup-map-instruction, .pickup-map-warning { color: #535650; font-size: var(--type-secondary); line-height: 1.45; }
.pickup-map-warning { padding: 12px; border-radius: 9px; background: #f2f3ef; }
.pickup-map > button { justify-self: start; min-height: 40px; }
@media (max-width: 760px) { .pickup-map-canvas { height: clamp(205px, 49dvh, 500px); } }
</style>
