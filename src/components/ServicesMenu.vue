<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowRight, ChevronDown } from "lucide-vue-next";
import { serviceGroups } from "../data";

defineProps<{ mobile?: boolean; current?: boolean }>();
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const panel = ref<HTMLElement>();
const open = ref(false);
let pinned = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function close() {
  clearTimeout(timer);
  open.value = pinned = false;
}
function enter(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  clearTimeout(timer);
  timer = setTimeout(() => (open.value = true), 150);
}
function leave(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  clearTimeout(timer);
  if (!pinned && !panel.value?.contains(document.activeElement))
    timer = setTimeout(close, 200);
}
function toggle() {
  clearTimeout(timer);
  if (open.value) close();
  else open.value = pinned = true;
}
function focusFirst() {
  clearTimeout(timer);
  open.value = pinned = true;
  nextTick(() => panel.value?.querySelector("a")?.focus());
}
function escape(event: KeyboardEvent) {
  if (!open.value) return;
  event.preventDefault();
  trigger.value?.focus();
  close();
}
function focusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) close();
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close();
}
onMounted(() => {
  if (trigger.value) document.addEventListener("pointerdown", outside);
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  document.removeEventListener("pointerdown", outside);
});
</script>

<template>
  <details v-if="mobile" class="mobile-services">
    <summary :aria-current="current ? 'page' : undefined">Услуги<ChevronDown :size="17" /></summary>
    <a class="services-all-mobile" href="#services">Все услуги <ArrowRight :size="16" aria-hidden="true" /></a>
    <details v-for="group in serviceGroups" :key="group.title">
      <summary>{{ group.title }}<ChevronDown :size="15" /></summary>
      <a v-for="service in group.items" :key="service.id" :href="`#services/${service.id}`">{{ service.title }}</a>
    </details>
  </details>
  <div
    v-else
    ref="root"
    class="desktop-services"
    @pointerenter="enter"
    @pointerleave="leave"
    @focusout="focusOut"
    @keydown.esc="escape"
  >
    <a class="nav-label" href="#services" :aria-current="current ? 'page' : undefined" @click="close" @keydown.down.prevent="focusFirst">Услуги</a>
    <button ref="trigger" type="button" class="services-toggle" :aria-label="open ? 'Свернуть список услуг' : 'Развернуть список услуг'"
      :aria-expanded="open" aria-controls="services-panel" @click="toggle" @keydown.down.prevent="focusFirst">
      <ChevronDown :size="14" :class="{ rotated: open }" aria-hidden="true" />
    </button>
    <div
      v-show="open"
      id="services-panel"
      ref="panel"
      class="services-panel"
    >
      <a class="services-all" href="#services" @click="close">Все услуги <ArrowRight :size="15" aria-hidden="true" /></a>
      <section v-for="group in serviceGroups" :key="group.title">
        <h2>{{ group.title }}</h2>
        <ul>
          <li v-for="service in group.items" :key="service.title">
            <a :href="`#services/${service.id}`" @click="close">{{ service.title }}</a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.desktop-services { display: flex; align-items: center; gap: 2px; }
.services-toggle { display: grid; place-items: center; width: 26px; min-height: 40px; color: #e2e6e4; border-radius: 6px; }
.services-toggle:hover, .services-toggle[aria-expanded="true"] { color: #fff; background: #ffffff15; }
.services-panel a, .mobile-services details a { display: block; }
.services-panel .services-all { display: flex; }
.mobile-services details a { display: flex; align-items: center; padding: 9px 14px; min-height: 44px; }

.services-all{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;padding:9px 8px;border-radius:6px;color:#ffc107;font-weight:700;text-align:left}.services-all:hover{background:#ffffff15}.services-all-mobile{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 14px;color:#ffc107;font-size:14px;font-weight:700;text-align:left}
</style>
