<template>
  <div class="message">
    <div class="logo">
      <img class="logo-img" :src="siteLogo" alt="logo" />
      <div :class="{ name: true, 'text-hidden': true, long: siteLabel.main.length >= 6 }">
        <span class="bg">{{ siteLabel.main }}</span>
        <span v-if="siteLabel.sub" class="sm">.{{ siteLabel.sub }}</span>
      </div>
    </div>
    <div class="description cards" @click="changeBox">
      <div class="content">
        <Icon size="16">
          <QuoteLeft />
        </Icon>
        <Transition name="fade" mode="out-in">
          <div :key="descriptionText.hello + descriptionText.text" class="text">
            <p>{{ descriptionText.hello }}</p>
            <p>{{ descriptionText.text }}</p>
          </div>
        </Transition>
        <Icon size="16">
          <QuoteRight />
        </Icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { QuoteLeft, QuoteRight } from "@vicons/fa";
import { Error as ErrorIcon } from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();
const siteLogo = import.meta.env.VITE_SITE_MAIN_LOGO;

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

const descriptionText = reactive({
  hello: import.meta.env.VITE_DESC_HELLO,
  text: import.meta.env.VITE_DESC_TEXT,
});

const changeBox = () => {
  if (store.getInnerWidth >= 721) {
    store.boxOpenState = !store.boxOpenState;
    return;
  }

  ElMessage({
    message: "当前页面宽度不足以打开功能面板",
    grouping: true,
    icon: h(ErrorIcon, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

watch(
  () => store.boxOpenState,
  (value) => {
    if (value) {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO_OTHER;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT_OTHER;
    } else {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT;
    }
  },
);
</script>

<style lang="scss" scoped>
.message {
  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    animation: fade 0.5s;
    max-width: 460px;
    .logo-img {
      border-radius: 50%;
      width: 120px;
    }
    .name {
      width: 100%;
      padding-left: 22px;
      transform: translateY(-8px);
      font-family: "Pacifico-Regular";

      .bg {
        font-size: 5rem;
      }

      .sm {
        margin-left: 6px;
        font-size: 2rem;
        @media (min-width: 721px) and (max-width: 789px) {
          display: none;
        }
      }
    }
    @media (max-width: 768px) {
      .logo-img {
        width: 100px;
      }
      .name {
        height: 128px;
        .bg {
          font-size: 4.5rem;
        }
      }
    }

    @media (max-width: 720px) {
      max-width: 100%;
    }
  }

  .description {
    padding: 1rem;
    margin-top: 3.5rem;
    max-width: 460px;
    animation: fade 0.5s;

    .content {
      display: flex;
      justify-content: space-between;

      .text {
        margin: 0.75rem 1rem;
        line-height: 2rem;
        margin-right: auto;
        transition: opacity 0.2s;

        p {
          &:nth-of-type(1) {
            font-family: "Pacifico-Regular";
          }
        }
      }

      .xicon:nth-of-type(2) {
        align-self: flex-end;
      }
    }
    @media (max-width: 720px) {
      max-width: 100%;
      pointer-events: none;
    }
  }
}
</style>
