<script setup lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowRight, MapPin } from "lucide-vue-next";
import { useMobileSheet } from "../composables/useMobileSheet";
import { deliveryAddressLine, hasDeliveryAddress, resolveDeliveryAddress, type DeliveryPoint, type DeliverySelection } from "../delivery";
import BaseModal from "./BaseModal.vue";
import DeliveryAddress from "./DeliveryAddress.vue";

const PickupMap = defineAsyncComponent(() => import("./PickupMap.vue"));
const props = defineProps<{ initial: "manual" | "map"; address: string; point?: DeliveryPoint; addressMode: string }>();
const emit = defineEmits<{ close: []; confirm: [selection: DeliverySelection] }>();
const sheet = useMobileSheet();
const mode = ref(props.initial);
const address = ref(props.address);
const point = ref(props.point);
const invalid = ref(false);
const lookup = ref<"loading" | "unavailable">();
const form = ref<HTMLFormElement>();
let request: AbortController | undefined;

function focusAddress() {
  nextTick(() => form.value?.querySelector("input")?.focus({ preventScroll: true }));
}
onMounted(() => { if (mode.value === "manual") focusAddress(); });
onBeforeUnmount(() => request?.abort());

function changeMode(value: "manual" | "map") {
  mode.value = value;
  if (value === "manual") {
    request?.abort();
    lookup.value = undefined;
    focusAddress();
  }
}
function editAddress(value: string) {
  request?.abort();
  lookup.value = undefined;
  address.value = value;
  invalid.value = false;
}
async function pickPoint(value: DeliveryPoint) {
  request?.abort();
  const lookupRequest = new AbortController();
  request = lookupRequest;
  point.value = value;
  address.value = "";
  invalid.value = false;
  lookup.value = "loading";
  const timer = setTimeout(() => lookupRequest.abort(), 6500);
  try {
    const result = await resolveDeliveryAddress(value, lookupRequest.signal);
    if (lookupRequest.signal.aborted) return;
    address.value = result;
    lookup.value = result ? undefined : "unavailable";
  } catch {
    if (!lookupRequest.signal.aborted) lookup.value = "unavailable";
  } finally {
    clearTimeout(timer);
    if (request === lookupRequest && lookup.value === "loading") lookup.value = "unavailable";
  }
}
function confirmAddress() {
  if (!hasDeliveryAddress(address.value)) {
    invalid.value = true;
    focusAddress();
    return;
  }
  emit("confirm", { address: deliveryAddressLine(address.value), point: mode.value === "map" ? point.value : undefined });
}
</script>

<template>
  <BaseModal :title="mode === 'map' ? 'Выберите адрес на карте' : 'Введите адрес доставки'" :sheet="sheet" :wide="mode === 'map'" @close="emit('close')">
    <div class="pickup-dialog">
      <PickupMap v-if="mode === 'map'" :point="point" @select="pickPoint" />
      <form ref="form" class="pickup-address-form" @submit.prevent="confirmAddress">
        <DeliveryAddress :model-value="addressMode" :address="address" :presets="[]" :address-mode="addressMode"
          address-only :invalid="invalid" @update:address="editAddress" />
        <p v-if="lookup" class="pickup-instruction" role="status">{{ lookup === "loading" ? "Определяем адрес…" : "Введите улицу и номер дома для выбранной точки." }}</p>
        <div class="pickup-dialog-actions">
          <button type="button" class="pickup-mode-action" @mousedown.prevent @click="changeMode(mode === 'map' ? 'manual' : 'map')">
            <MapPin :size="17" aria-hidden="true" /> {{ mode === "map" ? "Ввести вручную" : "Выбрать на карте" }}
          </button>
          <button type="submit" class="button button-primary" @mousedown.prevent>Подтвердить адрес <ArrowRight :size="17" aria-hidden="true" /></button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<style scoped>
.pickup-dialog, .pickup-address-form { display: grid; gap: 12px; }
.pickup-instruction { color: #535650; font-size: var(--type-secondary); line-height: 1.45; }
.pickup-dialog-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
.pickup-mode-action { display: inline-flex; align-items: center; gap: 7px; min-height: 44px; color: #765700; font-size: var(--type-control); text-decoration: underline; text-underline-offset: 3px; }
.pickup-address-form :deep(.pickup-field) { min-width: 0; }
.pickup-address-form :deep(.pickup-suggestions) {
  position: static;
  width: 100%;
  max-height: 146px;
  overflow-y: auto;
  margin-top: 6px;
  box-shadow: none;
}
@media (max-width: 760px) {
  .pickup-dialog-actions { flex-direction: column; align-items: stretch; }
  .pickup-mode-action { align-self: start; }
}
</style>
