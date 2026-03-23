<template>
  <APlayer
    v-if="playList[0]"
    ref="player"
    :audio="playList"
    :autoplay="store.playerAutoplay"
    :theme="theme"
    :autoSwitch="false"
    :loop="store.playerLoop"
    :order="store.playerOrder"
    :volume="volume"
    :showLrc="true"
    :listFolded="listFolded"
    :listMaxHeight="listMaxHeight"
    :noticeSwitch="false"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTimeUp"
    @error="loadMusicError"
  />
</template>

<script setup>
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import APlayer from "@worstone/vue-aplayer";

const store = mainStore();
const player = ref(null);
const playList = ref([]);
const playIndex = ref(0);

const props = defineProps({
  theme: {
    type: String,
    default: "#efefef",
  },
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => value >= 0 && value <= 1,
  },
  songServer: {
    type: String,
    default: "netease",
  },
  songType: {
    type: String,
    default: "playlist",
  },
  songId: {
    type: String,
    default: "7452421335",
  },
  listFolded: {
    type: Boolean,
    default: false,
  },
  listMaxHeight: {
    type: Number,
    default: 420,
  },
});

const listHeight = computed(() => `${props.listMaxHeight}px`);

const showPlayerLoadError = (message) => {
  ElMessage({
    message,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

const initPlayer = async () => {
  try {
    const res = await getPlayerList(props.songServer, props.songType, props.songId);
    store.musicIsOk = true;
    playList.value = res;
  } catch (error) {
    console.error(error);
    store.musicIsOk = false;
    showPlayerLoadError(error?.message || "播放器加载失败");
  }
};

const onPlay = () => {
  playIndex.value = player.value.aplayer.index;
  store.setPlayerState(player.value.audioRef.paused);
  store.setPlayerData(playList.value[playIndex.value].name, playList.value[playIndex.value].artist);
  ElMessage({
    message: `${store.getPlayerData.name} - ${store.getPlayerData.artist}`,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

const onPause = () => {
  store.setPlayerState(player.value.audioRef.paused);
};

const onTimeUp = () => {
  const lyrics = player.value.aplayer.lyrics[playIndex.value];
  const lyricIndex = player.value.aplayer.lyricIndex;
  if (!lyrics || !lyrics[lyricIndex]) {
    return;
  }

  let lrc = lyrics[lyricIndex][1];
  if (lrc === "Loading") {
    lrc = "歌词加载中...";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  store.setPlayerLrc(lrc);
};

const playToggle = () => {
  player.value?.toggle();
};

const changeVolume = (value) => {
  player.value?.setVolume(value, false);
};

const changeSong = (type) => {
  if (!player.value) return;
  type === 0 ? player.value.skipBack() : player.value.skipForward();
  nextTick(() => {
    player.value?.play();
  });
};

const toggleList = () => {
  player.value?.toggleList();
};

const loadMusicError = () => {
  const notice =
    playList.value.length > 1
      ? "播放歌曲出错，播放器将在 2s 后尝试下一首"
      : "播放歌曲出错";
  ElMessage({
    message: notice,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#efefef",
      duration: 2000,
    }),
  });

  const currentTrack = player.value?.aplayer?.audio?.[player.value.aplayer.index];
  if (currentTrack?.name) {
    console.error(`播放歌曲出错: ${currentTrack.name}`);
  }
};

onMounted(() => {
  nextTick(() => {
    initPlayer();
  });
});

defineExpose({ playToggle, changeVolume, changeSong, toggleList });
</script>

<style lang="scss" scoped>
.aplayer {
  width: 80%;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    background-color: transparent;
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 7px 0 6px 6px;
        height: 44px;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    height: v-bind(listHeight);
    background-color: transparent;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
