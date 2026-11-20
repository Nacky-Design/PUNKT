<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { X } from "lucide-vue-next";
defineProps<{ title: string; wide?: boolean; sheet?: boolean }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLElement>();
let previous: HTMLElement | null = null;
function keys(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    emit("close");
  }
  if (e.key === "Tab") {
    const items = Array.from(
      dialog.value!.querySelectorAll<HTMLElement>(
        'button:not([disabled]),input:not([disabled]),a[href],select,textarea,[tabindex="0"]',
      ),
    ).filter((e) => e.getClientRects().length);
    const first = items[0],
      last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
}
onMounted(() => {
  previous = document.activeElement as HTMLElement;
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", keys);
  dialog.value?.querySelector<HTMLElement>("button")?.focus();
});
onBeforeUnmount(() => {
  document.body.style.overflow = "";
  document.removeEventListener("keydown", keys);
  previous?.focus();
});
</script>
<template>
  <Teleport to="body"
    ><div class="modal-backdrop" :class="{ 'modal-backdrop--sheet': sheet }" @click.self="emit('close')">
      <section
        ref="dialog"
        class="modal"
        :class="{ 'modal-wide': wide, 'modal--sheet': sheet }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div class="modal-heading">
          <h2 id="dialog-title">{{ title }}</h2>
          <button
            type="button"
            class="icon-button close-button"
            aria-label="Закрыть окно"
            @click="emit('close')"
          >
            <X :size="22" />
          </button>
        </div>
        <slot />
      </section></div
  ></Teleport>
</template>

<style scoped>
.modal-backdrop--sheet { align-items: flex-end; padding: 0; }
.modal--sheet {
  width: 100%;
  max-height: calc(100dvh - 20px);
  padding: 16px 16px max(18px, env(safe-area-inset-bottom));
  border-radius: 18px 18px 0 0;
}
</style>
