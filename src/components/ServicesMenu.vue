<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowRight, ChevronDown } from "lucide-vue-next";
import { serviceGroups } from "../data";

defineProps<{ mobile?: boolean; current?: boolean }>();
const emit = defineEmits<{ select: [id: string]; all: [] }>();
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
  if (pinned) close();
  else open.value = pinned = true;
}
function focusFirst() {
  clearTimeout(timer);
  open.value = pinned = true;
  nextTick(() => panel.value?.querySelector("button")?.focus());
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
function select(id: string) {
  trigger.value?.focus();
  close();
  emit("select", id);
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
    <button type="button" class="services-all-mobile" @click="emit('all')">Все услуги <ArrowRight :size="16" /></button>
    <details v-for="group in serviceGroups" :key="group.title">
      <summary>{{ group.title }}<ChevronDown :size="15" /></summary>
      <button
        v-for="service in group.items"
        :key="service.title"
        type="button"
        @click="select(service.id)"
      >
        {{ service.title }}
      </button>
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
    <button
      ref="trigger"
      type="button"
      class="nav-label services-toggle"
      :aria-current="current ? 'page' : undefined"
      :aria-expanded="open"
      aria-controls="services-panel"
      @click="close(); emit('all')"
      @keydown.down.prevent="focusFirst"
    >
      Услуги<ChevronDown :size="14" :class="{ rotated: open }" />
    </button>
    <div
      v-show="open"
      id="services-panel"
      ref="panel"
      class="services-panel"
    >
      <button class="services-all" type="button" @click="close(); emit('all')">Все услуги <ArrowRight :size="15" /></button>
      <section v-for="group in serviceGroups" :key="group.title">
        <h2>{{ group.title }}</h2>
        <ul>
          <li v-for="service in group.items" :key="service.title">
            <button
              type="button"
              @click="select(service.id)"
            >
              {{ service.title }}
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.services-all{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;padding:9px 8px;border-radius:6px;color:#ffc107;font-weight:700;text-align:left}.services-all:hover{background:#ffffff15}.services-all-mobile{display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 14px;color:#ffc107;font-size:14px;font-weight:700;text-align:left}
</style>
