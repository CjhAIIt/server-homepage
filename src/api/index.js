// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

const SITE_MANAGER_ACCOUNT = {
  username: "lab",
  password: "a6n107",
};

export const loginSiteManager = async ({ username, password }) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (
    username === SITE_MANAGER_ACCOUNT.username &&
    password === SITE_MANAGER_ACCOUNT.password
  ) {
    return {
      username: SITE_MANAGER_ACCOUNT.username,
      token: "site-manager-token",
    };
  }

  throw new Error("用户名或密码错误");
};

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const songApi = import.meta.env.VITE_SONG_API?.trim();
  if (!songApi) {
    throw new Error("未配置音乐接口地址");
  }

  let res;
  try {
    res = await fetch(`${songApi}?server=${server}&type=${type}&id=${id}`);
  } catch (error) {
    throw new Error("音乐接口无法连接");
  }

  if (!res.ok) {
    throw new Error(`音乐接口请求失败（${res.status}）`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || !data.length) {
    throw new Error("音乐列表为空");
  }

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};
