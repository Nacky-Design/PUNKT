<script setup lang="ts">
import HeaderMessengerIcon from "./HeaderMessengerIcon.vue";
import { messengerLinks } from "../contact";

const names = { telegram: "Telegram", whatsapp: "WhatsApp", max: "Max" } as const;
defineProps<{ channels: (keyof typeof names)[]; iconClass: string }>();
</script>

<template>
  <div role="group" aria-label="Мессенджеры">
    <component v-for="channel in channels" :key="channel" :is="messengerLinks[channel] ? 'a' : 'span'"
      :class="iconClass" :href="messengerLinks[channel]"
      :target="messengerLinks[channel] ? '_blank' : undefined" :rel="messengerLinks[channel] ? 'noopener noreferrer' : undefined"
      :role="messengerLinks[channel] ? undefined : 'img'"
      :aria-label="messengerLinks[channel] ? names[channel] : names[channel] + ', ссылка уточняется'"
      :title="messengerLinks[channel] ? names[channel] : names[channel] + ' · ссылка уточняется'">
      <HeaderMessengerIcon :kind="channel" />
    </component>
  </div>
</template>
