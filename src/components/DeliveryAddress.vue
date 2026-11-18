<script setup lang="ts">
import { computed, nextTick, ref, useId } from "vue";
import { ChevronDown, MapPin } from "lucide-vue-next";
import { usePopoverPlacement } from "../composables/usePopoverPlacement";

const mode = defineModel<string>({ required: true });
const address = defineModel<string>("address", { required: true });
const props = defineProps<{
  presets: string[];
  addressMode: string;
  invalid?: boolean;
  addressOnly?: boolean;
}>();

const streetDirectory = [
  { street: "улица Академика Королёва", houses: ["12", "12 к2", "15"] },
  { street: "Авиационная улица", houses: ["24с1"] },
  { street: "Тверская улица", houses: ["13", "14", "21"] },
  { street: "Арбат", houses: ["44", "53"] },
  { street: "Новый Арбат", houses: [] },
  { street: "Большая Никитская улица", houses: ["13", "19"] },
  { street: "Кутузовский проспект", houses: ["2/1", "38"] },
  { street: "Ленинградский проспект", houses: ["36", "39"] },
  { street: "проспект Мира", houses: ["111", "119"] },
  { street: "Пресненская набережная", houses: ["2", "6", "12"] },
  { street: "Петровка", houses: ["2", "38"] },
  { street: "Покровка", houses: ["17"] },
  { street: "Варшавское шоссе", houses: [] },
  { street: "Ленинский проспект", houses: [] },
  { street: "Ходынский бульвар", houses: [] },
];
type Option = { label: string; kind: "preset" | "manual" | "street" | "house" };
const id = useId();
const root = ref<HTMLElement>();
const input = ref<HTMLInputElement>();
const expanded = ref(false);
const showPresets = ref(false);
const active = ref(-1);
const display = computed(() => mode.value === props.addressMode ? address.value : mode.value);

function normalize(value: string) {
  return value.toLocaleLowerCase("ru").replaceAll("ё", "е")
    .replace(/^москва\s*,\s*/u, "")
    .replace(/(^|\s)(?:ул\.|пр-т)\s*/gu, " ")
    .replace(/[,.]/g, " ")
    .replace(/(^|\s)(?:улица|ул)(?=\s|$)/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const options = computed<Option[]>(() => {
  if (showPresets.value || mode.value !== props.addressMode || !address.value.trim()) {
    return props.addressOnly ? [] : [
      ...props.presets.map((label): Option => ({ label, kind: "preset" })),
      { label: props.addressMode, kind: "manual" },
    ];
  }

  const query = normalize(address.value);
  const matchedStreet = streetDirectory
    .filter(({ street }) => query === normalize(street) || query.startsWith(normalize(street) + " "))
    .sort((a, b) => normalize(b.street).length - normalize(a.street).length)[0];
  if (matchedStreet) {
    const house = query.slice(normalize(matchedStreet.street).length).trim().replace(/^(?:дом|д)\s+/u, "");
    if (house || /[\s,]$/u.test(address.value)) {
      return matchedStreet.houses.filter((value) => value.startsWith(house))
        .map((value) => ({ label: `${matchedStreet.street}, ${value}`, kind: "house" }));
    }
  }

  const matches: Option[] = props.addressOnly ? [] : props.presets
    .filter((label) => normalize(label).includes(query))
    .map((label) => ({ label, kind: "preset" }));
  if (query.length >= 2) {
    matches.push(...streetDirectory.filter(({ street }) => normalize(street).includes(query))
      .map(({ street }) => ({ label: street, kind: "street" } as const)));
  }
  return matches.slice(0, 6);
});

const open = computed(() => expanded.value && options.value.length > 0);
const above = usePopoverPlacement(root, () => open.value ? options.value.length : 0, ".select-menu");

function inputChanged(event: Event) {
  mode.value = props.addressMode;
  address.value = (event.target as HTMLInputElement).value;
  expanded.value = true;
  showPresets.value = false;
  active.value = -1;
}

function pick(option: Option) {
  if (option.kind === "preset") {
    mode.value = option.label;
  } else {
    mode.value = props.addressMode;
    if (option.kind === "street") address.value = option.label + ", ";
    if (option.kind === "house") address.value = option.label;
  }
  active.value = -1;
  showPresets.value = false;
  expanded.value = option.kind === "street";
  nextTick(() => {
    input.value?.focus();
    expanded.value = option.kind === "street";
    if (option.kind === "street") input.value?.setSelectionRange(address.value.length, address.value.length);
  });
}

function togglePresets() {
  const show = !open.value || !showPresets.value;
  input.value?.focus();
  showPresets.value = show;
  expanded.value = show;
  active.value = -1;
}

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    expanded.value = false;
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (!options.value.length && !props.addressOnly) showPresets.value = true;
    if (!options.value.length) return;
    event.preventDefault();
    expanded.value = true;
    const count = options.value.length;
    active.value = active.value < 0
      ? (event.key === "ArrowDown" ? 0 : count - 1)
      : (active.value + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
  } else if (event.key === "Enter" && open.value && options.value[active.value]) {
    event.preventDefault();
    pick(options.value[active.value]!);
  }
}
</script>

<template>
  <div ref="root" class="pickup-field">
    <div class="field pickup-input" :class="{ 'field-active': open, 'pickup-invalid': invalid }">
      <MapPin :size="22" aria-hidden="true" />
      <div class="field-text">
        <label :for="id" class="field-caption">{{ addressOnly ? "Адрес доставки · Москва" : "Место получения" }}</label>
        <input
          :id="id"
          ref="input"
          :value="display"
          class="field-value"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-expanded="open"
          :aria-controls="open ? id + '-suggestions' : undefined"
          :aria-activedescendant="open && active >= 0 ? id + '-option-' + active : undefined"
          :aria-invalid="!!invalid"
          :aria-describedby="invalid ? id + '-error' : undefined"
          :placeholder="mode === addressMode ? 'Улица и дом в Москве' : 'Офис, аэропорт или адрес'"
          maxlength="180"
          @focus="expanded = true; mode !== addressMode && input?.select()"
          @click="expanded = true; mode !== addressMode && input?.select()"
          @input="inputChanged"
          @blur="expanded = false; showPresets = false; active = -1"
          @keydown="onKey"
        />
      </div>
      <button
        v-if="!addressOnly"
        class="pickup-toggle"
        type="button"
        tabindex="-1"
        aria-label="Показать готовые места получения"
        @mousedown.prevent
        @click="togglePresets"
      ><ChevronDown :size="16" aria-hidden="true" :class="{ rotated: open }" /></button>
    </div>
    <div
      v-if="open"
      :id="id + '-suggestions'"
      class="select-menu pickup-suggestions"
      :class="{ 'popover-above': above }"
      role="listbox"
      aria-label="Варианты места получения"
    >
      <div
        v-for="(option, index) in options"
        :id="id + '-option-' + index"
        :key="option.label"
        role="option"
        :aria-selected="index === active"
        @mousedown.prevent
        @click="pick(option)"
      >{{ option.label }}</div>
    </div>
    <small v-if="invalid" :id="id + '-error'" class="error-text pickup-error">Введите улицу и номер дома</small>
  </div>
</template>
