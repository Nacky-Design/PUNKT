<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { ChevronDown, Check } from "lucide-vue-next";
defineProps<{ modelValue: string; label: string; options: string[] }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const open = ref(false),
  root = ref<HTMLElement>(),
  trigger = ref<HTMLButtonElement>();
function close(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) open.value = false;
}
function pick(value: string) {
  emit("update:modelValue", value);
  open.value = false;
  trigger.value?.focus();
}
async function move(e: KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  open.value = true;
  await nextTick();
  {
    const opts = Array.from(
      root.value!.querySelectorAll<HTMLButtonElement>("[role=option]"),
    );
    let index = opts.indexOf(document.activeElement as HTMLButtonElement);
    index =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? opts.length - 1
          : (index + (e.key === "ArrowUp" ? -1 : 1) + opts.length) %
            opts.length;
    opts[index]?.focus();
  }
}
onMounted(() => document.addEventListener("click", close));
onBeforeUnmount(() => document.removeEventListener("click", close));
</script>
<template>
  <div
    ref="root"
    class="select-field"
    @keydown.esc.stop="
      open = false;
      trigger?.focus();
    "
    @keydown="move"
  >
    <button
      ref="trigger"
      type="button"
      class="field"
      :class="{ 'field-active': open }"
      :aria-label="label + ': ' + modelValue"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open = !open"
    >
      <slot /><span class="field-text"
        ><span class="field-caption">{{ label }}</span
        ><span class="field-value">{{ modelValue }}</span></span
      ><ChevronDown :size="16" :class="{ rotated: open }" /></button
    ><Transition name="popover"
      ><div v-if="open" class="select-menu" role="listbox" :aria-label="label">
        <button
          v-for="option in options"
          :key="option"
          type="button"
          role="option"
          :aria-selected="option === modelValue"
          :class="{ selected: option === modelValue }"
          @click="pick(option)"
        >
          {{ option }}<Check v-if="option === modelValue" :size="16" />
        </button></div
    ></Transition>
  </div>
</template>
