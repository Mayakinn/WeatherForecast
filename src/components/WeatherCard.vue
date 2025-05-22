<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { addByCity } from "../services/WeatherService";

const props = defineProps<{
  name: string
  onDelete: () => void
}>();

const weather = ref<any>(null);

onMounted(async () => {
  weather.value = await addByCity(props.name);
});
</script>

<template>
  <div class="card" v-if="weather">
    <button class="delete is-pulled-right" @click="onDelete" style="margin: 1rem;"></button>
    <p class="title has-text-centered">{{ weather.name }} - {{ weather.sys.country }}</p>
    <div class="card-image has-text-centered">
      <figure class="image is-100x100 is-inline-block">
        <img :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`" alt="Weather icon" />
      </figure>
    </div>
    <div class="card-content">
      <p class="has-text-centered is-size-4 box">
        {{ weather.main.temp }}°C<br />
        Humidity: {{ weather.main.humidity }}<br />
        Wind: {{ weather.wind.speed }}<br />
        Pressure: {{ weather.main.pressure }}<br />
        Sunrise: {{ new Date(weather.sys.sunrise * 1000).toLocaleTimeString() }}<br />
        Sunset: {{ new Date(weather.sys.sunset * 1000).toLocaleTimeString() }}
      </p>
    </div>
  </div>
</template>