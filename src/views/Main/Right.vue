<template>
  <div :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <div class="logo text-hidden" @click="store.mobileFuncState = !store.mobileFuncState">
      <span class="bg">{{ siteLabel.main }}</span>
      <span v-if="siteLabel.sub" class="sm">.{{ siteLabel.sub }}</span>
    </div>
    <Func />
    <Link />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import Func from "@/views/Func/index.vue";
import Link from "@/components/Links.vue";

const store = mainStore();

const siteLabel = computed(() => {
  const label = import.meta.env.VITE_SITE_LABEL?.trim();
  if (label) {
    const [main, sub] = label.split(".");
    return { main, sub };
  }

  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return { main: "home", sub: "" };
  const plainUrl = url.replace(/^(https?:\/\/)/, "");
  const [main, sub] = plainUrl.split(".");
  return { main, sub };
});
</script>

<style lang="scss" scoped>
.right {
  width: 50%;
  margin-left: 0.75rem;
  .logo {
    width: 100%;
    font-family: "Pacifico-Regular";
    font-size: 2.25rem;
    position: fixed;
    top: 6%;
    left: 0;
    text-align: center;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    @media (min-width: 721px) {
      display: none;
    }
    @media (max-height: 720px) {
      width: calc(100% + 6px);
      top: 43.26px;
    }
    @media (max-width: 390px) {
      width: 391px;
    }
  }
  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    &.hidden {
      display: none;
    }
  }
}
</style>
