<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { serviceGroups } from "../data";

defineProps<{ mobile?: boolean }>();
const emit = defineEmits<{ select: [title: string, description: string] }>();
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
function select(title: string, description: string) {
  trigger.value?.focus();
  close();
  emit("select", title, description);
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
    <summary>Услуги<ChevronDown :size="17" /></summary>
    <details v-for="group in serviceGroups" :key="group.title">
      <summary>{{ group.title }}<ChevronDown :size="15" /></summary>
      <button
        v-for="service in group.items"
        :key="service.title"
        type="button"
        @click="select(service.title, service.description)"
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
      :aria-expanded="open"
      aria-controls="services-panel"
      @click="toggle"
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
      <section v-for="group in serviceGroups" :key="group.title">
        <h2>{{ group.title }}</h2>
        <ul>
          <li v-for="service in group.items" :key="service.title">
            <button
              type="button"
              @click="select(service.title, service.description)"
            >
              {{ service.title }}
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
