<script setup lang="ts">
import WeatherCard from './WeatherCard.vue';

const props = defineProps<{
  weathers: any[];
  onRemoveWeather: (name: string) => void;
}>();
</script>

<template>
  <div class="container" style="max-width: 800px; margin: 0 auto;">
    <div class="columns is-multiline is-centered">
      <div class="column is-5" v-for="weather in weathers" :key="weather.id">
        <WeatherCard :name="weather.name" :onDelete="() => onRemoveWeather(weather.name)" />
      </div>
    </div>
  </div>
</template>