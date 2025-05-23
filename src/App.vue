<script setup lang="ts">
import WeatherList from './components/WeatherList.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { addByCoords, addByZIP, addByCity } from './services/WeatherService'

const searchModal = ref(false)
const searchQuery = ref<any>('')
const storedWeather = ref<any[]>([])
const weather = ref<any>([])
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const loading = ref(true)
const refreshKey = ref(0)
const regexCords: RegExp = /^(-?\d+(\.\d+)?)[ ,]+(-?\d+(\.\d+)?)$/gm
const regexZipCode: RegExp = /\b\d{5},[a-z]{2}\b/gmi
let intervalId: ReturnType<typeof setInterval>

const totalPages = computed(() =>
  Math.ceil(filteredWeathers.value.length / itemsPerPage)
)

const paginatedWeathers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredWeathers.value.slice(start, start + itemsPerPage)
})

const onAddButtonClick = () => {
  searchModal.value = true
  searchQuery.value = ''
}

const updateStoredWeather = (data) => {
  storedWeather.value.push(data)
  localStorage.setItem('weatherData', JSON.stringify(storedWeather.value))
}

const getWeather = async () => {
  let testCords = regexCords.test(searchQuery.value.trim());
  let testZip = regexZipCode.test(searchQuery.value.trim());
  if (testCords) {
    let split = searchQuery.value.trim().split(' ')
    weather.value = await addByCoords(split)
    if (weather.value != null) {
      if (!storedWeather.value.some(w => w.name === weather.value.name)) {
        updateStoredWeather(weather.value)
      }
    }
    searchModal.value = false
  }
  else if (testZip) {
    weather.value = await addByZIP(searchQuery.value.trim())
    if (weather.value != null) {
      if (!storedWeather.value.some(w => w.name === weather.value.name)) {
        updateStoredWeather(weather.value)
      }
    }
    searchModal.value = false
  }
  else {
    weather.value = await addByCity(searchQuery.value.trim())
    if (weather.value != null) {
      if (!storedWeather.value.some(w => w.name === weather.value.name)) {
        updateStoredWeather(weather.value)
      }
    }
    searchModal.value = false
  }
}

const filteredWeathers = computed(() => {
  if (!searchTerm.value.trim()) return storedWeather.value
  return storedWeather.value.filter(w => {
    const term = searchTerm.value.toLowerCase()
    return w.name.toLowerCase().includes(term) || w.sys.country.toLowerCase().includes(term)
  })
})

const removeWeather = (name: string) => {
  storedWeather.value = storedWeather.value.filter(w => w.name !== name)
  localStorage.setItem('weatherData', JSON.stringify(storedWeather.value))
}

onMounted(() => {
  const saved = localStorage.getItem('weatherData')
  if (saved) {
    storedWeather.value = JSON.parse(saved)
  }
  loading.value = false
  intervalId = setInterval(() => {
    refreshKey.value++
  }, 60 * 1000 * 10)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

</script>

<template>
  <main>

    <div :class="['modal', { 'is-active': searchModal }]">
      <div class="modal-background" @click="searchModal = false"></div>
      <div class="modal-content">
        <input class="input" type="text" placeholder="examples: (London) (24.12 23.04) (12345,us)"
          v-model="searchQuery">
        <button class="button is-primary my-3" @click="getWeather">Add</button>
      </div>
      <button class="modal-close" aria-label="close" @click="searchModal = false"></button>
    </div>

    <button class="button is-white mx-5 my-5" @click="onAddButtonClick">Add new Forecast</button>

    <div v-if="loading">
      <p>Loading</p>
    </div>

    <div v-else>
      <div class="is-flex is-justify-content-center my-3">
        <input class="input is-normal" style="width: 300px;" type="text" placeholder="Filter added forecasts..."
          v-model="searchTerm" />
      </div>
      <WeatherList :weathers="paginatedWeathers" :onRemoveWeather="removeWeather" :key="refreshKey" />
    </div>

    <div class="buttons is-centered mx-5 my-3">
      <button class="button " v-for="page in totalPages" :key="page" :class="{ 'is-primary': currentPage === page }"
        @click="currentPage = page">
        {{ page }}
      </button>
    </div>

  </main>

  <p class="has-text-centered is-size-4">The data is refreshed every 10 minutes!</p>

</template>