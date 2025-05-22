import axios from "axios";
const apiKey = import.meta.env.VITE_API_KEY;

const addByCoords = async (query: any[]) => {
  console.log(query);
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: query[0],
          lon: query[1],
          appid: apiKey,
          units: "metric",
        },
      }
    );
    const data = response.data;
    if (!data.name) {
      alert(`Error: ${data.message || "City not found"}`);
      return;
    } else return data;
  } catch (error) {
    alert("Not found by these coordinates");
    console.error("Error fetching weather:", error);
  }
};

const addByZIP = async (query: string) => {
  console.log("ZIP query:", query);
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          zip: query,
          appid: apiKey,
          units: "metric",
        },
      }
    );
    const data = response.data;
    if (!data.name) {
      alert(`Error: ${data.message || "City not found"}`);
      return;
    } else return data;
  } catch (error) {
    alert("Not found by this ZIP");
    console.error("Error fetching weather:", error);
  }
};

const addByCity = async (query: string) => {
  console.log(query);
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: query,
          appid: apiKey,
          units: "metric",
        },
      }
    );
    const data = response.data;
    if (!data.name) {
      alert(`Error: ${data.message || "City not found"}`);
      return;
    } else return data;
  } catch (error) {
    alert("Not found by this name");
    console.error("Error fetching weather:", error);
  }
};

export { addByCoords, addByCity, addByZIP };
