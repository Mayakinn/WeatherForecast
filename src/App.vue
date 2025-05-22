<script setup lang="ts">
import WeatherList from './components/WeatherList.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { addByCoords, addByZIP, addByCity } from './service/WeatherService'

const searchModal = ref(false)
const q = ref<any>('')
const ids = ref<any[]>([])
const weather = ref<any>([])
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const loading = ref(true)
const refreshKey = ref(0)
const regexCords: RegExp = /^(-?\d+(\.\d+)?)[ ,]+(-?\d+(\.\d+)?)$/gm
const regexzipCode: RegExp = /\d*[,][a-z]{2}/gm
let intervalId: ReturnType<typeof setInterval>

const totalPages = computed(() =>
  Math.ceil(filteredWeathers.value.length / itemsPerPage)
)

const paginatedWeathers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredWeathers.value.slice(start, start + itemsPerPage)
})

const clickAddButton = () => {
  searchModal.value = true
  q.value = ''
}

const getWeather = async () => {
  let testCords = regexCords.test(q.value.trim());
  let testZip = regexzipCode.test(q.value.trim());
  if (testCords) {
    let split = q.value.trim().split(' ')
    weather.value = await addByCoords(split)
    if (weather.value != null) {
      if (!ids.value.some(w => w.name === weather.value.name)) {
        ids.value.push(weather.value)
        localStorage.setItem('weatherData', JSON.stringify(ids.value))
      }
    }
    searchModal.value = false
  }
  else if (testZip) {
    weather.value = await addByZIP(q.value.trim())
    if (weather.value != null) {
      if (!ids.value.some(w => w.name === weather.value.name)) {
        ids.value.push(weather.value)
        localStorage.setItem('weatherData', JSON.stringify(ids.value))
      }
    }
    searchModal.value = false
  }
  else {
    weather.value = await addByCity(q.value.trim())
    if (weather.value != null) {
      if (!ids.value.some(w => w.name === weather.value.name)) {
        ids.value.push(weather.value)
        localStorage.setItem('weatherData', JSON.stringify(ids.value))
      }
    }
    searchModal.value = false
  }
}

const filteredWeathers = computed(() => {
  if (!searchTerm.value.trim()) return ids.value
  return ids.value.filter(w => {
    const term = searchTerm.value.toLowerCase()
    return w.name.toLowerCase().includes(term) || w.sys.country.toLowerCase().includes(term)
  })
})

const removeWeather = (name: string) => {
  ids.value = ids.value.filter(w => w.name !== name)
  localStorage.setItem('weatherData', JSON.stringify(ids.value))
}

onMounted(() => {
  const saved = localStorage.getItem('weatherData')
  if (saved) {
    ids.value = JSON.parse(saved)
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
        <input class="input" type="text" placeholder="examples: (London) (24.12 23.04) (12345,us)" v-model="q">
        <button class="button is-primary" @click="getWeather">Add</button>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="searchModal = false"></button>
    </div>

    <button class="button is-white" @click="clickAddButton">Add new Forecast</button>

    <div v-if="loading">
      <p>Loading</p>
    </div>

    <div v-else>
      <input class="input my-4" type="text" placeholder="Filter added forecasts..." v-model="searchTerm" />
      <WeatherList :weathers="paginatedWeathers" :removeWeather="removeWeather" :key="refreshKey" />
    </div>

    <div class="buttons is-centered my-4">
      <button class="button" v-for="page in totalPages" :key="page" :class="{ 'is-primary': currentPage === page }"
        @click="currentPage = page">
        {{ page }}
      </button>
    </div>

  </main>

  <p class="has-text-centered is-size-4">The data is refreshed every 10 minutes!</p>

</template>