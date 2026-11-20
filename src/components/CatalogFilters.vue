<script lang="ts">
export type CatalogFilterState = {
  brand: string;
  fuel: string;
  drive: string;
  transmission: string;
  seats: number | null;
  extras: string[];
};
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-vue-next';
import { useMobileSheet } from '../composables/useMobileSheet';
import BaseModal from './BaseModal.vue';
import SelectField from './SelectField.vue';
import type { Car } from '../data';

const props = defineProps<{ filters: CatalogFilterState; allCars: Car[] }>();
const emit = defineEmits<{ apply: [filters: CatalogFilterState] }>();
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const panel = ref<HTMLElement>();
const open = ref(false);
const sheet = useMobileSheet();
const empty = (): CatalogFilterState => ({ brand: '', fuel: '', drive: '', transmission: '', seats: null, extras: [] });
const clone = (filters: CatalogFilterState): CatalogFilterState => ({ ...filters, extras: [...(filters.extras ?? [])] });
const draft = ref<CatalogFilterState>(clone(props.filters));
watch(() => props.filters, value => { if (!open.value) draft.value = clone(value); }, { deep: true });
const extras = [
  'Детское кресло', 'Доп. водитель в договор',
  'Кондиционер', 'Автозапуск',
  'Навигатор', 'Багажник на крышу',
  'Видеорегистратор', 'Антирадар',
];

const brands = computed(() => {
  const counts = new Map<string, number>();
  for (const car of props.allCars) {
    const brand = car.name.split(' ')[0]!;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
});
const fuels = computed(() => [...new Set(props.allCars.map(car => car.fuel))]);
const drives = computed(() => [...new Set(props.allCars.map(car => car.drive))]);
const seats = computed(() => [...new Set(props.allCars.map(car => car.seats))].sort((a, b) => a - b));
const activeCount = computed(() => [props.filters.brand, props.filters.fuel, props.filters.drive, props.filters.transmission, props.filters.seats].filter(Boolean).length + (props.filters.extras?.length ?? 0));
function toggle() {
  if (open.value) { close(); return; }
  draft.value = clone(props.filters);
  if (sheet.value) trigger.value?.focus({ preventScroll: true });
  open.value = true;
  if (!sheet.value) nextTick(() => panel.value?.focus());
}
function close(restoreFocus = false) {
  open.value = false;
  if (restoreFocus) nextTick(() => trigger.value?.focus());
}
function apply() {
  emit('apply', clone(draft.value));
  close(true);
}
function reset() {
  draft.value = empty();
}
function outside(event: PointerEvent) {
  if (!sheet.value && open.value && !root.value?.contains(event.target as Node)) close();
}
function escape(event: KeyboardEvent) {
  if (!sheet.value && open.value && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
}
watch(sheet, () => { if (open.value) close(true); });
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); });
</script>

<template>
  <div ref="root" class="catalog-parameters">
    <button ref="trigger" type="button" class="parameters-trigger" :aria-expanded="open" :aria-controls="open ? 'catalog-parameters-panel' : undefined" :aria-haspopup="sheet ? 'dialog' : undefined" @click="toggle">
      <SlidersHorizontal :size="17" aria-hidden="true" />
      <span>Все параметры<span v-if="activeCount" class="active-count">{{ activeCount }}</span></span>
      <ChevronDown :size="16" aria-hidden="true" :class="{ rotated: open }" />
    </button>
    <component v-if="open" :is="sheet ? BaseModal : 'section'"
      v-bind="sheet ? { title: 'Дополнительные параметры автомобиля', sheet: true } : { class: 'parameters-panel', 'aria-label': 'Дополнительные параметры автомобиля' }"
      @close="close(true)">
      <div id="catalog-parameters-panel" ref="panel" tabindex="-1">
        <div v-if="!sheet" class="panel-heading"><div><h2>Параметры автомобиля</h2></div><button class="close-panel" type="button" aria-label="Закрыть параметры" @click="close(true)"><X :size="19" aria-hidden="true" /></button></div>
        <div class="parameter-fields">
          <SelectField appearance="panel" label="Коробка передач" :model-value="draft.transmission || 'Любая'" :options="['Любая', 'Автомат']"
            @update:model-value="draft.transmission = $event === 'Любая' ? '' : $event" />
          <SelectField appearance="panel" label="Топливо" :model-value="draft.fuel || 'Любое'" :options="['Любое', ...fuels]"
            @update:model-value="draft.fuel = $event === 'Любое' ? '' : $event" />
          <SelectField appearance="panel" label="Привод" :model-value="draft.drive || 'Любой'" :options="['Любой', ...drives]"
            @update:model-value="draft.drive = $event === 'Любой' ? '' : $event" />
          <SelectField appearance="panel" label="Количество мест" :model-value="draft.seats?.toString() || 'Любое'" :options="['Любое', ...seats.map(String)]"
            @update:model-value="draft.seats = $event === 'Любое' ? null : Number($event)" />
        </div>
        <fieldset class="extras-section">
          <legend>Дополнительные опции</legend>
          <div class="extras-grid">
            <label v-for="option in extras" :key="option" class="extra-option">
              <input v-model="draft.extras" type="checkbox" :value="option" />
              <span>{{ option }}</span>
            </label>
          </div>
        </fieldset>
        <div class="brands-section"><p class="brands-label">Марка</p><div class="brand-options" role="group" aria-label="Марка автомобиля">
          <button type="button" :aria-pressed="draft.brand === ''" :class="{ selected: draft.brand === '' }" @click="draft.brand = ''">Любая</button>
          <button v-for="brand in brands" :key="brand.name" type="button" :aria-pressed="draft.brand === brand.name" :class="{ selected: draft.brand === brand.name }" @click="draft.brand = brand.name">{{ brand.name }} <span>{{ brand.count }}</span></button>
        </div></div>
        <div class="panel-actions"><button class="reset" type="button" @click="reset">Сбросить фильтр</button><button class="apply" type="button" @click="apply">Применить</button></div>
      </div>
    </component>
  </div>
</template>

<style scoped>
.catalog-parameters{position:relative;min-width:0;align-self:stretch}.parameters-trigger{width:100%;height:100%;min-height:48px;display:flex;align-items:center;gap:9px;padding:10px 13px;border:0;border-radius:8px;background:#f5f5f3;color:#252525;font-size:13px;font-weight:650;text-align:left;white-space:nowrap}.parameters-trigger>span{flex:1}.parameters-trigger:hover,.parameters-trigger[aria-expanded=true]{background:#efefeb}.parameters-trigger svg:last-child{transition:transform .2s}.parameters-trigger .rotated{transform:rotate(180deg)}.active-count{display:inline-grid;place-items:center;min-width:19px;height:19px;margin-left:6px;padding:0 4px;border-radius:50%;background:#ffc107;color:#222;font-size:10px}.parameters-panel{position:absolute;top:calc(100% + 10px);right:0;z-index:80;width:min(680px,calc(100vw - 32px));max-height:min(70vh,620px);overflow-y:auto;padding:24px;border:1px solid #e0e0dd;border-radius:15px;background:#fff;box-shadow:0 16px 45px #0002;color:#202020;outline:none}.panel-heading{display:flex;align-items:start;justify-content:space-between;gap:20px;margin-bottom:20px}.panel-heading h2{margin:0;font-size:20px;line-height:1.2;letter-spacing:-.025em}.panel-heading p{margin:5px 0 0;font-size:12px;color:#777}.close-panel{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:50%;background:#f3f3f1}.close-panel:hover{background:#ffe6a0}.parameter-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}.brands-section{margin-top:22px;padding-top:19px;border-top:1px solid #e9e9e6}.brands-label{margin:0 0 10px;font-size:10px;letter-spacing:.12em;font-weight:750;text-transform:uppercase;color:#888}.brand-options{display:flex;gap:7px;flex-wrap:wrap}.brand-options button{padding:8px 12px;border-radius:20px;background:#f3f3f1;font-size:12px;color:#333}.brand-options button span{margin-left:3px;color:#888;font-size:11px}.brand-options button.selected{background:#202020;color:#fff}.brand-options button.selected span{color:#ddd}.brand-options button:hover:not(.selected){background:#e8e8e3}.panel-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:22px;padding-top:18px;border-top:1px solid #e9e9e6}.panel-actions button{font-size:13px;font-weight:700}.reset{padding:9px 0;color:#555}.reset:hover{color:#151515}.apply{padding:11px 23px;border-radius:8px;background:#ffc107;color:#171717}.apply:hover{background:#eeb400}
.extras-section{min-width:0;margin:22px 0 0;padding:18px 0 0;border:0;border-top:1px solid #e9e9e6}.extras-section legend{padding:0;font-size:12px;font-weight:700;color:#333}.extras-section p{margin:4px 0 13px;font-size:11px;line-height:1.4;color:#777}.extras-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 16px}.extras-grid .extra-option{display:flex;align-items:flex-start;gap:9px;min-width:0;padding:0;border:0;font-size:13px;font-weight:500;color:#333;line-height:1.35;cursor:pointer}.extra-option input{flex:none;width:17px;height:17px;margin:0;accent-color:#ffc107}.extra-option span{min-width:0}
@media(max-width:650px){.parameters-panel{padding:17px;max-height:min(70dvh,600px)}.parameter-fields{gap:10px}.panel-heading{margin-bottom:15px}.panel-heading h2{font-size:18px}.brands-section{margin-top:17px;padding-top:15px}.extras-section{margin-top:17px;padding-top:13px}.extras-grid{gap:12px}.extras-grid .extra-option{font-size:12px}.panel-actions{margin-top:16px;padding-top:14px}}

.parameters-trigger, .panel-actions button, .brand-options button { font-size: var(--type-control); }
.active-count, .brands-label, .brand-options button span, .extras-section legend, .extras-grid .extra-option { font-size: var(--type-secondary); }
.extras-section legend { margin-bottom: 10px; }
</style>
