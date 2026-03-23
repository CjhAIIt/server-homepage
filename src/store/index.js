import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      imgLoadStatus: false,
      innerWidth: null,
      siteManageLoggedIn: false,
      siteManageUser: null,
      customSiteLinks: [],
      coverType: "0",
      siteStartShow: false,
      musicClick: false,
      musicIsOk: false,
      musicVolume: 0,
      musicOpenState: false,
      backgroundShow: false,
      boxOpenState: false,
      mobileOpenState: false,
      mobileFuncState: false,
      setOpenState: false,
      playerState: false,
      playerTitle: null,
      playerArtist: null,
      playerLrc: "歌词加载中...",
      playerLrcShow: true,
      footerBlur: true,
      playerAutoplay: false,
      playerLoop: "all",
      playerOrder: "list",
    };
  },
  getters: {
    getPlayerLrc(state) {
      return state.playerLrc;
    },
    getPlayerData(state) {
      return {
        name: state.playerTitle,
        artist: state.playerArtist,
      };
    },
    getInnerWidth(state) {
      return state.innerWidth;
    },
    getCustomSiteLinks(state) {
      return state.customSiteLinks;
    },
  },
  actions: {
    setInnerWidth(value) {
      this.innerWidth = value;
      if (value >= 720) {
        this.mobileOpenState = false;
        this.mobileFuncState = false;
      }
    },
    setPlayerState(value) {
      if (value) {
        this.playerState = false;
      } else {
        this.playerState = true;
      }
    },
    setPlayerLrc(value) {
      this.playerLrc = value;
    },
    setPlayerData(title, artist) {
      this.playerTitle = title;
      this.playerArtist = artist;
    },
    setImgLoadStatus(value) {
      this.imgLoadStatus = value;
    },
    setSiteManageSession(value) {
      this.siteManageLoggedIn = Boolean(value?.token);
      this.siteManageUser = value ? { username: value.username, token: value.token } : null;
    },
    logoutSiteManage() {
      this.siteManageLoggedIn = false;
      this.siteManageUser = null;
    },
    addCustomSiteLink(value) {
      this.customSiteLinks.push(value);
    },
  },
  persist: {
    key: "data",
    storage: window.localStorage,
    paths: [
      "siteManageLoggedIn",
      "siteManageUser",
      "customSiteLinks",
      "coverType",
      "musicVolume",
      "siteStartShow",
      "musicClick",
      "playerLrcShow",
      "footerBlur",
      "playerAutoplay",
      "playerLoop",
      "playerOrder",
    ],
  },
});
