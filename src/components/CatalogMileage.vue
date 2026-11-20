<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Check, ChevronDown } from 'lucide-vue-next';
import { money } from '../data';
import { usePopoverPlacement } from '../composables/usePopoverPlacement';
import { useMobileSheet } from '../composables/useMobileSheet';
import BaseModal from './BaseModal.vue';

const props = defineProps<{
  modelValue: string;
  prices: Record<string, number>;
  days: number;
  dayLabel: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const sheet = useMobileSheet();
const open = ref(false);
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const options = ref<HTMLElement>();
const above = usePopoverPlacement(root, () => open.value && !sheet.value, '.mileage-picker');
const current = computed(() => props.modelValue.replace(/\s*\/\s*сутки$/, ''));
const included = computed(() => props.prices[props.modelValue] === 0);

async function openPicker() {
  trigger.value?.focus({ preventScroll: true });
  open.value = true;
  await nextTick();
  options.value?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true });
}

function close(restoreFocus = true) {
  open.value = false;
  if (restoreFocus) trigger.value?.focus({ preventScroll: true });
}

function choose(option: string) {
  emit('update:modelValue', option);
  close();
}

function reveal() {
  trigger.value?.scrollIntoView({ block: 'center', behavior: 'instant' });
  void openPicker();
}
defineExpose({ reveal });

function outside(event: PointerEvent) {
  if (!sheet.value && open.value && !root.value?.contains(event.target as Node)) close(false);
}

function leave(event: FocusEvent) {
  if (!sheet.value && open.value && !root.value?.contains(event.relatedTarget as Node)) close(false);
}

function escape(event: KeyboardEvent) {
  if (sheet.value || !open.value) return;
  event.preventDefault();
  event.stopPropagation();
  close();
}

watch(sheet, () => { if (open.value) close(); });
onMounted(() => document.addEventListener('pointerdown', outside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside));
</script>

<template>
  <div ref="root" class="catalog-mileage" @focusout="leave" @keydown.esc="escape">
    <button ref="trigger" type="button" class="mileage-trigger" :aria-expanded="open"
      :aria-controls="open ? 'catalog-mileage-options' : undefined" :aria-haspopup="sheet ? 'dialog' : undefined"
      @click="open ? close() : openPicker()">
      <span class="mileage-label">Пробег в сутки</span>
      <span class="mileage-value">{{ current }}<span v-if="included"> · включено</span></span>
      <ChevronDown :size="16" aria-hidden="true" />
    </button>

    <component v-if="open" :is="sheet ? BaseModal : 'div'"
      v-bind="sheet ? { title: 'Пробег в сутки', sheet: true } : { class: ['mileage-picker', { 'mileage-picker--above': above }] }"
      @close="close()">
      <div id="catalog-mileage-options" ref="options" class="mileage-options" role="group" aria-label="Пакеты пробега">
        <button v-for="(extra, option) in prices" :key="option" type="button" :aria-pressed="option === modelValue" @click="choose(option)">
          <span>
            <strong>{{ option }}</strong>
            <small>{{ extra ? '+' + money(extra) + ' ₽ в сутки' : 'Включено в базовую цену' }}</small>
            <small v-if="extra && days > 1">+{{ money(extra * days) }} ₽ за {{ days }} {{ dayLabel }}</small>
          </span>
          <Check v-if="option === modelValue" :size="18" aria-hidden="true" />
        </button>
      </div>
      <p class="mileage-terms">Километры сверх лимита оплачиваются отдельно. Ставку смотрите в карточке автомобиля. Правила расчёта на несколько суток уточняйте перед арендой.</p>
    </component>
  </div>
</template>

<style scoped>
.catalog-mileage { position: relative; min-width: 0; border-left: 1px solid #e8e8e5; }
.mileage-trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  align-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 46px;
  gap: 4px 8px;
  padding: 6px 12px;
  border-radius: 7px;
  text-align: left;
}
.mileage-trigger:hover, .mileage-trigger[aria-expanded="true"] { background: #faf5e8; }
.mileage-trigger svg { grid-column: 2; grid-row: 1 / 3; color: #595b55; }
.mileage-label { grid-area: 1 / 1; color: #60615c; font-size: 11px; font-weight: 650; }
.mileage-value { grid-area: 2 / 1; color: #222; font-size: 13px; font-weight: 700; }
.mileage-value span { color: #5d5f5a; font-weight: 500; }
.mileage-picker {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 38;
  width: min(340px, calc(100vw - 32px));
  max-height: 70vh;
  overflow: auto;
  padding: 12px;
  border: 1px solid #e4e4df;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 28px #17171724;
}
.mileage-picker--above { top: auto; bottom: calc(100% + 10px); }
.mileage-options { display: grid; gap: 6px; }
.mileage-options button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 52px;
  padding: 8px 12px;
  border: 1px solid #e3e3dd;
  border-radius: 8px;
  text-align: left;
}
.mileage-options button[aria-pressed="true"] { border-color: #c59511; background: #fff2c7; }
.mileage-options button:hover { border-color: #977319; }
.mileage-options svg { flex: none; color: #735400; }
.mileage-options strong { font-size: 14px; }
.mileage-options small { display: block; margin-top: 3px; color: #50514c; font-size: 12px; line-height: 1.35; }
.mileage-terms { margin: 10px 2px 0; color: #4d504b; font-size: 12px; line-height: 1.5; }
@media (max-width: 1179px) {
  .catalog-mileage { border-left: 0; border-top: 1px solid #e8e8e5; }
  .mileage-trigger { grid-template-columns: 1fr auto auto; grid-template-rows: auto; min-height: 40px; }
  .mileage-trigger svg { grid-column: 3; grid-row: 1; }
  .mileage-value { grid-area: 1 / 2; }
  .mileage-picker { right: auto; left: 0; }
}
@media (min-width: 931px) and (max-width: 1179px) {
  .mileage-trigger { width: fit-content; min-width: 250px; }
}
@media (max-width: 760px) {
  .mileage-trigger { min-height: 44px; padding-inline: 10px; }
  .mileage-label { font-size: 12px; }
}
</style>
