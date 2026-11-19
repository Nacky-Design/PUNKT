<script setup lang="ts">
import { ArrowUpRight, Fuel, Settings2, UsersRound } from "lucide-vue-next";
import CarArt from "./CarArt.vue";
import { money, type Car } from "../data";

defineProps<{ car: Car; detailed?: boolean }>();
defineEmits<{ select: [car: Car] }>();
</script>

<template>
  <button
    type="button"
    class="car-card"
    :class="{ 'car-card--detailed': detailed }"
    @click="$emit('select', car)"
  >
    <span class="card-class">{{ car.category }}</span>
    <CarArt
      :image="detailed ? car.fleetImage ?? car.image : car.image"
      :name="car.name"
    />
    <span class="car-card-bottom">
      <strong>{{ car.name }}</strong>
      <span v-if="detailed" class="car-card-specs">
        <span><Settings2 :size="15" aria-hidden="true" />Автомат</span>
        <span><UsersRound :size="15" aria-hidden="true" />{{ car.seats }} мест</span>
        <span><Fuel :size="15" aria-hidden="true" />{{ car.fuel }}</span>
      </span>
      <span>от <b>{{ money(car.price) }} ₽</b><small> / сутки</small></span>
    </span>
    <span class="card-arrow" aria-hidden="true"><ArrowUpRight :size="16" /></span>
  </button>
</template>
