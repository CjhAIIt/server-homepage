<template>
  <div v-if="allSiteLinks.length" class="links">
    <div class="line">
      <div class="headline">
        <Icon size="20">
          <Link />
        </Icon>
        <span class="title">网站列表（{{ allSiteLinks.length }}）</span>
      </div>
      <div class="actions">
        <span v-if="store.siteManageLoggedIn" class="user-chip">
          {{ store.siteManageUser?.username }}
        </span>
        <el-button
          v-if="!store.siteManageLoggedIn"
          size="small"
          plain
          @click="openLoginDialog"
        >
          登录
        </el-button>
        <el-button
          v-if="store.siteManageLoggedIn"
          size="small"
          type="primary"
          @click="openAddDialog"
        >
          新增网站
        </el-button>
        <el-button
          v-if="store.siteManageLoggedIn"
          size="small"
          plain
          @click="handleLogout"
        >
          退出
        </el-button>
      </div>
    </div>
    <Swiper
      :modules="[Pagination, Mousewheel]"
      :slides-per-view="1"
      :space-between="40"
      :pagination="{
        el: '.swiper-pagination',
        clickable: true,
        bulletElement: 'div',
      }"
      :mousewheel="true"
    >
      <SwiperSlide v-for="(siteGroup, pageIndex) in siteLinksList" :key="`site-page-${pageIndex}`">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in siteGroup" :key="`${pageIndex}-${index}`" :span="8">
            <div
              class="item cards"
              :style="index < 3 ? 'margin-bottom: 20px' : null"
              @click="jumpLink(item)"
            >
              <Icon size="26">
                <component :is="getSiteIcon(item.icon)" />
              </Icon>
              <span class="name text-hidden">{{ item.name || "未命名网站" }}</span>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>

    <el-dialog v-model="loginDialogVisible" title="网站管理登录" width="360px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="loginDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loginLoading" @click="handleLogin">登录</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addDialogVisible" title="新增网站" width="420px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="网站名称">
          <el-input
            v-model="addForm.name"
            maxlength="20"
            show-word-limit
            placeholder="例如：设备看板"
          />
        </el-form-item>
        <el-form-item label="网站地址">
          <el-input
            v-model="addForm.link"
            placeholder="例如：http://172.18.8.107:8080"
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="addForm.icon" placeholder="请选择图标">
            <el-option
              v-for="item in iconOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSite">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode } from "@vicons/fa";
import { loginSiteManager } from "@/api";
import { mainStore } from "@/store";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper/modules";
import defaultSiteLinks from "@/assets/siteLinks.json";

const store = mainStore();

const loginDialogVisible = ref(false);
const loginLoading = ref(false);
const addDialogVisible = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

const addForm = reactive({
  name: "",
  link: "",
  icon: "Link",
});

const siteIconMap = {
  Link,
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
};

const iconOptions = [
  { label: "默认链接", value: "Link" },
  { label: "博客", value: "Blog" },
  { label: "网盘", value: "Cloud" },
  { label: "音乐", value: "CompactDisc" },
  { label: "导航", value: "Compass" },
  { label: "文档", value: "Book" },
  { label: "热点", value: "Fire" },
  { label: "开发", value: "LaptopCode" },
];

const allSiteLinks = computed(() => {
  const customSiteLinks = Array.isArray(store.customSiteLinks) ? store.customSiteLinks : [];
  return [...defaultSiteLinks, ...customSiteLinks];
});

const siteLinksList = computed(() => {
  const result = [];
  for (let i = 0; i < allSiteLinks.value.length; i += 6) {
    result.push(allSiteLinks.value.slice(i, i + 6));
  }
  return result;
});

const getSiteIcon = (icon) => {
  return siteIconMap[icon] || Link;
};

const normalizeLink = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `http://${trimmed}`;
};

const resetAddForm = () => {
  addForm.name = "";
  addForm.link = "";
  addForm.icon = "Link";
};

const openLoginDialog = () => {
  loginForm.username = store.siteManageUser?.username || "";
  loginForm.password = "";
  loginDialogVisible.value = true;
};

const openAddDialog = () => {
  if (!store.siteManageLoggedIn) {
    openLoginDialog();
    ElMessage.warning("请先登录后再新增网站");
    return;
  }

  resetAddForm();
  addDialogVisible.value = true;
};

const handleLogin = async () => {
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
    loginDialogVisible.value = false;
    ElMessage.success("登录成功");
  } catch (error) {
    ElMessage.error(error?.message || "登录失败");
  } finally {
    loginLoading.value = false;
  }
};

const handleLogout = () => {
  store.logoutSiteManage();
  ElMessage.success("已退出登录");
};

const handleAddSite = () => {
  if (!store.siteManageLoggedIn) {
    openLoginDialog();
    return;
  }

  const name = addForm.name.trim();
  const link = normalizeLink(addForm.link);

  if (!name || !link) {
    ElMessage.warning("请填写完整的网站信息");
    return;
  }

  store.addCustomSiteLink({
    icon: addForm.icon,
    name,
    link,
  });

  addDialogVisible.value = false;
  resetAddForm();
  ElMessage.success(`已新增网站，当前共 ${allSiteLinks.value.length} 个`);
};

const jumpLink = (data) => {
  if (!data?.link) {
    ElMessage.warning("该网站暂未配置地址");
    return;
  }

  if ((data.name === "音乐" || data.name === "闊充箰") && store.musicClick) {
    if (typeof $openList === "function") $openList();
    return;
  }

  window.open(data.link, "_blank");
};
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    animation: fade 0.5s;
    .headline {
      display: flex;
      align-items: center;
    }
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .user-chip {
      min-width: 54px;
      height: 28px;
      padding: 0 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: rgb(255 255 255 / 12%);
      backdrop-filter: blur(10px);
      font-size: 0.85rem;
      color: #fff;
    }
  }
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;
    .swiper-slide {
      height: 100%;
    }
    .swiper-pagination {
      margin-top: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 20px;
        height: 4px;
        margin: 0 4px;
        border-radius: 4px;
        opacity: 0.2;
        transition: opacity 0.3s;
        &.swiper-pagination-bullet-active {
          opacity: 1;
        }
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  .link-all {
    height: 220px;
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      padding: 0 10px;
      animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }

      &:active {
        transform: scale(1);
      }

      .name {
        font-size: 1.1rem;
        margin-left: 8px;
      }
      @media (min-width: 720px) and (max-width: 820px) {
        .name {
          display: none;
        }
      }
      @media (max-width: 720px) {
        height: 80px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        .name {
          font-size: 1rem;
          margin-left: 0;
          margin-top: 8px;
        }
      }
    }
    @media (max-width: 720px) {
      height: 180px;
    }
  }
}
</style>
