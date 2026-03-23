<template>
  <Loading />
  <Background @loadComplete="loadComplete" />
  <Transition name="fade" mode="out-in">
    <main id="main" v-if="store.imgLoadStatus">
      <div class="container" v-show="!store.backgroundShow">
        <section class="all" v-show="!store.setOpenState">
          <MainLeft />
          <MainRight v-show="!store.boxOpenState" />
          <Box v-show="store.boxOpenState" />
        </section>
        <section class="more" v-show="store.setOpenState" @click="store.setOpenState = false">
          <MoreSet />
        </section>
      </div>
      <Icon
        class="menu"
        size="24"
        v-show="!store.backgroundShow"
        @click="store.mobileOpenState = !store.mobileOpenState"
      >
        <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
      </Icon>
      <Transition name="fade" mode="out-in">
        <Footer class="f-ter" v-show="!store.backgroundShow && !store.setOpenState" />
      </Transition>

      <Transition name="fade" mode="out-in">
        <div v-if="!store.siteManageLoggedIn" class="login-screen">
          <div class="login-card cards" @click.stop>
            <div class="login-title">主页登录</div>
            <div class="login-desc">访问 172.18.8.107 时需先登录后进入首页</div>
            <el-form label-position="top">
              <el-form-item label="用户名">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  @keyup.enter="handleSiteLogin"
                />
              </el-form-item>
              <el-form-item label="密码">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  show-password
                  placeholder="请输入密码"
                  @keyup.enter="handleSiteLogin"
                />
              </el-form-item>
            </el-form>
            <el-button type="primary" :loading="loginLoading" @click="handleSiteLogin">
              进入主页
            </el-button>
          </div>
        </div>
      </Transition>
    </main>
  </Transition>
</template>

<script setup>
import { helloInit, checkDays } from "@/utils/getTime.js";
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { loginSiteManager } from "@/api";
import { mainStore } from "@/store";
import { Icon } from "@vicons/utils";
import Loading from "@/components/Loading.vue";
import MainLeft from "@/views/Main/Left.vue";
import MainRight from "@/views/Main/Right.vue";
import Background from "@/components/Background.vue";
import Footer from "@/components/Footer.vue";
import Box from "@/views/Box/index.vue";
import MoreSet from "@/views/MoreSet/index.vue";
import cursorInit from "@/utils/cursor.js";
import config from "@/../package.json";

const store = mainStore();
const loginLoading = ref(false);
const loginForm = reactive({
  username: store.siteManageUser?.username || "",
  password: "",
});

const getWidth = () => {
  store.setInnerWidth(window.innerWidth);
};

const loadComplete = () => {
  nextTick(() => {
    helloInit();
    checkDays();
  });
};

const handleSiteLogin = async () => {
  if (!loginForm.username.trim() || !loginForm.password) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }

  loginLoading.value = true;
  try {
    const session = await loginSiteManager({
      username: loginForm.username.trim(),
      password: loginForm.password,
    });
    store.setSiteManageSession(session);
    loginForm.password = "";
    ElMessage.success("登录成功");
  } catch (error) {
    ElMessage.error(error?.message || "登录失败");
  } finally {
    loginLoading.value = false;
  }
};

watch(
  () => store.innerWidth,
  (value) => {
    if (value < 721) {
      store.boxOpenState = false;
      store.setOpenState = false;
    }
  },
);

onMounted(() => {
  cursorInit();

  document.oncontextmenu = () => {
    ElMessage({
      message: "为了浏览体验，当前页面禁用右键",
      grouping: true,
      duration: 2000,
    });
    return false;
  };

  window.addEventListener("mousedown", (event) => {
    if (event.button === 1) {
      store.backgroundShow = !store.backgroundShow;
      ElMessage({
        message: `${store.backgroundShow ? "开启" : "关闭"}壁纸展示状态`,
        grouping: true,
      });
    }
  });

  getWidth();
  window.addEventListener("resize", getWidth);

  const styleTitle1 = "font-size: 20px;font-weight: 600;color: rgb(244,167,89);";
  const styleTitle2 = "font-size:12px;color: rgb(244,167,89);";
  const styleContent = "color: rgb(30,152,255);";
  const title1 = "主页";
  const title2 = `
 _____ __  __  _______     ____     __
|_   _|  \\/  |/ ____\\ \\   / /\\ \\   / /
  | | | \\  / | (___  \\ \\_/ /  \\ \\_/ /
  | | | |\\/| |\\___ \\  \\   /    \\   /
 _| |_| |  | |____) |  | |      | |
|_____|_|  |_|_____/   |_|      |_|`;
  const content = `\n\n版本: ${config.version}\n首页: ${config.home}\nGithub: ${config.github}`;
  console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", getWidth);
});
</script>

<style lang="scss" scoped>
#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(1.2);
  transition: transform 0.3s;
  animation: fade-blur-main-in 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: 0.5s;
  .container {
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    padding: 0 0.5vw;
    .all {
      width: 100%;
      height: 100%;
      padding: 0 0.75rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    .more {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
    }
    @media (max-width: 1200px) {
      padding: 0 2vw;
    }
  }
  .menu {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 84%;
    left: calc(50% - 28px);
    width: 56px;
    height: 34px;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    .i-icon {
      transform: translateY(2px);
    }
    @media (min-width: 721px) {
      display: none;
    }
  }
  .login-screen {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 45%);
    backdrop-filter: blur(16px);
    padding: 24px;
    .login-card {
      width: min(420px, 100%);
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .login-title {
      font-size: 1.5rem;
      font-weight: 600;
    }
    .login-desc {
      font-size: 0.95rem;
      color: rgb(255 255 255 / 75%);
      line-height: 1.6;
    }
  }
  @media (max-height: 720px) {
    overflow-y: auto;
    overflow-x: hidden;
    .container {
      height: 721px;
      .more {
        height: 721px;
        width: calc(100% + 6px);
      }
      @media (min-width: 391px) {
        padding-left: 0.7vw;
        padding-right: 0.25vw;
        @media (max-width: 1200px) {
          padding-left: 2.3vw;
          padding-right: 1.75vw;
        }
        @media (max-width: 1100px) {
          padding-left: 2vw;
          padding-right: calc(2vw - 6px);
        }
        @media (max-width: 992px) {
          padding-left: 2.3vw;
          padding-right: 1.7vw;
        }
        @media (max-width: 900px) {
          padding-left: 2vw;
          padding-right: calc(2vw - 6px);
        }
      }
    }
    .menu {
      top: 605.64px;
      left: 170.5px;
      @media (min-width: 391px) {
        left: calc(50% - 25px);
      }
    }
    .f-ter {
      top: 675px;
      @media (min-width: 391px) {
        padding-left: 6px;
      }
    }
  }
  @media (max-width: 390px) {
    overflow-x: auto;
    .container {
      width: 391px;
    }
    .menu {
      left: 167.5px;
    }
    .f-ter {
      width: 391px;
    }
    @media (min-height: 721px) {
      overflow-y: hidden;
    }
  }
}
</style>
