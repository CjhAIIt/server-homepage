<template>
  <div class="weather" v-if="weatherData.city && weatherData.weather">
    <span>{{ weatherData.city }}&nbsp;</span>
    <span>{{ weatherData.weather }}&nbsp;</span>
    <span>{{ weatherData.temperature }}&deg;C</span>
    <span class="sm-hidden">
      &nbsp;{{ formatWindDirection(weatherData.windDirection) }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.windPower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { Error as ErrorIcon } from "@icon-park/vue-next";

const AMAP_SCRIPT_ID = "amap-weather-sdk";
const AMAP_SCRIPT_URL = "https://webapi.amap.com/maps";

let amapLoader = null;

const weatherKey = (import.meta.env.VITE_WEATHER_KEY || "").trim();
const weatherSecurityCode = (import.meta.env.VITE_WEATHER_SECURITY_CODE || "").trim();
const fallbackCity = (import.meta.env.VITE_WEATHER_CITY || "芜湖市").trim();

const weatherData = reactive({
  city: null,
  weather: null,
  temperature: null,
  windDirection: null,
  windPower: null,
});

const formatWindDirection = (value) => {
  if (!value) return "-";
  return value.endsWith("风") ? value : `${value}风`;
};

const loadAmap = () => {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (amapLoader) {
    return amapLoader;
  }

  if (!weatherKey) {
    return Promise.reject(new Error("未配置高德 Web 端 Key"));
  }

  amapLoader = new Promise((resolve, reject) => {
    if (weatherSecurityCode) {
      window._AMapSecurityConfig = {
        securityJsCode: weatherSecurityCode,
      };
    }

    const existingScript = document.getElementById(AMAP_SCRIPT_ID);
    const script =
      existingScript ||
      Object.assign(document.createElement("script"), {
        id: AMAP_SCRIPT_ID,
        src: `${AMAP_SCRIPT_URL}?v=2.0&key=${weatherKey}&plugin=AMap.CitySearch,AMap.Weather`,
        async: true,
        defer: true,
      });

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const handleLoad = () => {
      cleanup();
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error("高德 JS API 加载失败"));
      }
    };

    const handleError = () => {
      cleanup();
      reject(new Error("高德 JS API 加载失败"));
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  return amapLoader;
};

const getCurrentCity = (AMap) => {
  return new Promise((resolve, reject) => {
    const citySearch = new AMap.CitySearch();

    citySearch.getLocalCity((status, result) => {
      if (status === "complete" && (result?.adcode || result?.city)) {
        resolve({
          city: result.city || result.province || fallbackCity,
          adcode: result.adcode || null,
        });
        return;
      }

      reject(new Error(result?.info || "城市定位失败"));
    });
  });
};

const getLiveWeather = (AMap, city) => {
  return new Promise((resolve, reject) => {
    const weather = new AMap.Weather();

    weather.getLive(city, (error, liveData) => {
      if (error) {
        reject(new Error(error.info || "天气查询失败"));
        return;
      }

      if (!liveData) {
        reject(new Error("天气数据为空"));
        return;
      }

      resolve(liveData);
    });
  });
};

const onError = (message) => {
  ElMessage({
    message,
    icon: h(ErrorIcon, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

const getWeatherData = async () => {
  try {
    const AMap = await loadAmap();

    let cityInfo;
    try {
      cityInfo = await getCurrentCity(AMap);
    } catch (error) {
      cityInfo = {
        city: fallbackCity,
        adcode: null,
      };
      console.warn("城市自动定位失败，已切换到固定城市:", error);
    }

    const liveWeather = await getLiveWeather(AMap, cityInfo.adcode || cityInfo.city);

    weatherData.city = liveWeather.city || cityInfo.city;
    weatherData.weather = liveWeather.weather;
    weatherData.temperature = liveWeather.temperature;
    weatherData.windDirection = liveWeather.windDirection;
    weatherData.windPower = liveWeather.windPower;
  } catch (error) {
    console.error("天气信息获取失败:", error);
    onError(error?.message || "天气信息获取失败");
  }
};

onMounted(() => {
  getWeatherData();
});
</script>
