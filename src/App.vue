<script setup lang="ts">
import WeatherList from './components/WeatherList.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
const apiKey = import.meta.env.VITE_API_KEY;
console.log(apiKey)
const searchModal = ref(false)
const q = ref<any>('')
const ids = ref<any[]>([])
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const loading = ref(true)
const refreshKey = ref(0)
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

const getWeather = () => {
  const regexCords: RegExp = /^(-?\d+(\.\d+)?)[ ,]+(-?\d+(\.\d+)?)$/gm
  const regexzipCode: RegExp = /\d*[,][a-z]{2}/gm
  let testCords = regexCords.test(q.value.trim());
  let testZip = regexzipCode.test(q.value.trim());
  console.log("is it coords : " + testCords + "Is it zip : " + testZip)
  if (testCords) {
    console.log("COORDINATES")
    let split = q.value.trim().split(' ')
    addByCoords(split)
  }
  else if (testZip) {
    console.log("ZIP KODAS")
    addByZIP(q.value.trim())
  }
  else {
    console.log("Miestas ")

    addByCity(q.value.trim())
  }
}

const addByCoords = async (query: any[]) => {
  console.log(query)
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: query[0],
        lon: query[1],
        appid: apiKey,
        units: 'metric'
      }
    })


    const data = response.data
    if (!data.name) {
      alert(`Error: ${data.message || 'City not found'}`)
      return
    }
    if (!ids.value.some(w => w.name === data.name)) {
      ids.value.push(data)
    }
    localStorage.setItem('weatherData', JSON.stringify(ids.value))
    searchModal.value = false

  } catch (error) {
    alert("Not found by these coordinates")
    console.error('Error fetching weather:', error)

  }

}

const addByZIP = async (query: string) => {
  console.log('ZIP query:', query)
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        zip: query,
        appid: apiKey,
        units: 'metric'
      }
    })

    const data = response.data
    console.log('Fetched data:', data)

    if (!data.name) {
      alert(`Error: ${data.message || 'City not found'}`)
      return
    }

    const exists = ids.value.some(w => w.name === data.name)
    console.log('Already exists in ids?', exists)

    if (!exists) {
      ids.value.push(data)
      console.log('After push:', ids.value)
      localStorage.setItem('weatherData', JSON.stringify(ids.value))
      console.log('Saved to localStorage')
    } else {
      console.log('Data already present, skipping push')
    }

    searchModal.value = false

  } catch (error) {
    alert("Not found by this ZIP")
    console.error('Error fetching weather:', error)
  }
}


const addByCity = async (query: string) => {
  console.log(query)
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: query,
        appid: apiKey,
        units: 'metric'
      }
    })


    const data = response.data
    if (!data.name) {
      alert(`Error: ${data.message || 'City not found'}`)
      return
    }
    if (!ids.value.some(w => w.name === data.name)) {
      ids.value.push(data)
    }
    localStorage.setItem('weatherData', JSON.stringify(ids.value))
    searchModal.value = false

  } catch (error) {
    alert("Not found by this name")
    console.error('Error fetching weather:', error)

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
        <input class="input" type="text" placeholder="Search" v-model="q">
        <button class="button is-primary" @click="getWeather">Press here to Add</button>
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

  <p class="has-text-centered is-size-4">The data is refreshed every 10 minute!</p>
</template>