import axios from "axios";
const apiKey = import.meta.env.VITE_API_KEY;
const apiURL = "https://api.openweathermap.org/data/2.5/weather";

const addByCoords = async (query: any[]) => {
  try {
    const response = await axios.get(apiURL, {
      params: {
        lat: query[0],
        lon: query[1],
        appid: apiKey,
        units: "metric",
      },
    });
    const data = response.data;
    if (!data.name) {
      alert(`Error: ${data.message || "Location not found"}`);
      return;
    }
    return data;
  } catch (error) {
    onError("Location not found by these coordinates");
  }
};

const addByZIP = async (query: string) => {
  try {
    const response = await axios.get(apiURL, {
      params: {
        zip: query,
        appid: apiKey,
        units: "metric",
      },
    });
    const data = response.data;
    if (!data.name) {
      alert(`Error: ${data.message || "Location not found"}`);
      return;
    }
    return data;
  } catch (error) {
    onError("Location not found by the ZIP code");
  }
};

const addByCity = async (query: string) => {
  try {
    const response = await axios.get(apiURL, {
      params: {
        q: query,
        appid: apiKey,
        units: "metric",
      },
    });
    const data = response.data;
    if (!data.name) {
      alert(`Error: ${data.message || "Location not found"}`);
      return;
    }
    return data;
  } catch (error) {
    onError("Location not found by the name");
  }
};

const onError = (string: string) => {
  alert(string);
  throw new Error(string);
};

export { addByCoords, addByCity, addByZIP };
