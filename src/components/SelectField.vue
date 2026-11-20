<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, useId } from "vue";
import { usePopoverPlacement } from "../composables/usePopoverPlacement";
import { ChevronDown, Check } from "lucide-vue-next";
defineProps<{
  modelValue: string;
  label: string;
  options: string[];
  displayValue?: string;
  actionLabel?: string;
  optionDetails?: Record<string, string>;
  appearance?: "catalog" | "inline" | "panel";
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const open = ref(false),
  root = ref<HTMLElement>(),
  trigger = ref<HTMLButtonElement>();
const menuId = useId();
const above = usePopoverPlacement(root, () => open.value, ".select-menu");
function outside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}
function leave(event: FocusEvent) {
  if (event.relatedTarget instanceof Node && !root.value?.contains(event.relatedTarget)) open.value = false;
}
function close() {
  open.value = false;
  trigger.value?.focus({ preventScroll: true });
}
function escape(event: KeyboardEvent) {
  if (!open.value) return;
  event.stopPropagation();
  event.preventDefault();
  close();
}
async function toggle() {
  if (open.value) {
    close();
    return;
  }
  open.value = true;
  await nextTick();
  const selected = root.value?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
  const first = root.value?.querySelector<HTMLButtonElement>('[role="option"]');
  (selected ?? first)?.focus({ preventScroll: true });
}
function pick(value: string) {
  emit("update:modelValue", value);
  close();
}
async function move(e: KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  open.value = true;
  await nextTick();
  if (!root.value) return;
  const options = Array.from(root.value.querySelectorAll<HTMLButtonElement>("[role=option]"));
  if (!options.length) return;
  const current = options.indexOf(document.activeElement as HTMLButtonElement);
  let index = 0;
  if (e.key === "End" || (e.key === "ArrowUp" && current === -1)) index = options.length - 1;
  else if (e.key === "ArrowUp") index = (current - 1 + options.length) % options.length;
  else if (e.key === "ArrowDown") index = (current + 1) % options.length;
  options[index]?.focus();
}
onMounted(() => document.addEventListener("click", outside));
onBeforeUnmount(() => document.removeEventListener("click", outside));
</script>
<template>
  <div
    ref="root"
    class="select-field"
    :class="appearance && `select-field--${appearance}`"
    @focusout="leave"
    @keydown.esc="escape"
    @keydown="move"
  >
    <button
      ref="trigger"
      type="button"
      class="field"
      :class="[appearance && `field--${appearance}`, { 'field-active': open }]"
      :aria-label="label + ': ' + modelValue"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? menuId : undefined"
      @click="toggle"
    >
      <slot /><span class="field-text"
        ><span v-if="!displayValue" class="field-caption">{{ label }}</span
        ><span class="field-value">{{ displayValue ?? modelValue }}</span></span
      ><span v-if="actionLabel" class="field-action">{{ actionLabel }}</span>
      <ChevronDown v-else :size="16" :class="{ rotated: open }" /></button
    ><Transition name="popover"
      ><div
        v-if="open"
        :id="menuId"
        class="select-menu"
        :class="{ 'popover-above': above }"
        role="listbox"
        :aria-label="label"
      >
        <button
          v-for="option in options"
          :key="option"
          type="button"
          tabindex="-1"
          role="option"
          :aria-selected="option === modelValue"
          :class="{ selected: option === modelValue }"
          @click="pick(option)"
        >
          <span>{{ option }}<small v-if="optionDetails?.[option]" class="option-detail">{{ optionDetails[option] }}</small></span>
          <Check v-if="option === modelValue" :size="16" />
        </button></div
    ></Transition>
  </div>
</template>

<style scoped>
.select-field--catalog .field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 7px;
  height: 100%;
  min-height: 52px;
  padding: 8px 11px;
  border: 0;
  border-radius: 7px;
  background: transparent;
}
.select-field--catalog .field:hover,
.select-field--catalog .field-active,
.select-field--inline .field:hover,
.select-field--inline .field-active { background: #f4f4f1; box-shadow: none; }
.select-field--catalog .field > svg { align-self: end; margin-bottom: 2px; }
.select-field--catalog .field-caption { color: #5d5f5a; font-size: var(--type-secondary); font-weight: 650; letter-spacing: 0; }
.select-field--catalog .field-value,
.select-field--inline .field-value { color: #222; font-size: var(--type-control); font-weight: 650; line-height: 1.2; }
.select-field--inline .field { height: auto; min-height: 42px; padding: 7px 12px; border-color: #dedfdc; border-radius: 8px; }
.select-field--inline .field-active { border-color: #c9ccc5 !important; }
.select-field--inline .select-menu { right: 0; left: auto; }
.select-field--catalog .select-menu,
.select-field--inline .select-menu {
  width: max-content;
  max-width: min(360px, calc(100vw - 44px));
  max-height: min(290px, 60dvh);
  overflow: auto;
  overscroll-behavior: contain;
}
.select-field--catalog .select-menu button,
.select-field--inline .select-menu button { min-height: 44px; padding: 9px 10px; font-size: var(--type-control); }
.select-menu button:focus-visible { outline-offset: -2px; }
.select-menu button svg { flex: none; }
.select-field--inline .select-menu button { padding-inline: 12px; }
.select-field--panel .field { width: 100%; min-height: 54px; height: auto; padding: 7px 10px; border-radius: 8px; }
.select-field--panel .field-caption { font-size: var(--type-secondary); font-weight: 650; color: #5d5f5a; }
.select-field--panel .field-value { font-size: var(--type-control); }
.select-field--panel .select-menu { position: static; width: 100%; max-height: 190px; margin-top: 5px; overflow-y: auto; overscroll-behavior: contain; }
.select-field--panel .select-menu button { min-height: 44px; font-size: var(--type-control); }
.select-field--panel .select-menu button span { overflow-wrap: anywhere; }
@media (max-width: 700px) {
  .select-field--catalog .select-menu { width: 100%; }
}
</style>
