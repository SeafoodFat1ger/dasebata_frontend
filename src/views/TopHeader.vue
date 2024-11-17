<template>
  <el-container class="fixed-header">
    <!-- 顶部栏 -->
    <el-header class="content-header">
      <!-- 显示网站名称 -->
      <div v-if="!isSmallScreen" class="content-aside-topShow-logoAndName" @click="gotoHome">
        北航BBS
      </div>
      <!-- 搜索框 -->
      <div class="content-search">
        <el-input :prefix-icon="Search"></el-input>
      </div>

      <!-- 响应式菜单栏 -->
      <div v-if="!isSmallScreen" class="content-menu">
        <el-menu  mode="horizontal" :ellipsis="false" router>
          <el-menu-item index="/home/home">
            <el-icon>
              <House/>
            </el-icon>
            <span>首页热榜</span>
          </el-menu-item>
          <el-sub-menu index="/abc">
            <template #title>
              <el-icon>
                <Document/>
              </el-icon>
              讨论区域
            </template>
            <el-menu-item index="/home/posts">
              <span>帖子列表</span>
            </el-menu-item>
            <el-menu-item index="/home/posts">
              <span>问题列表</span>
            </el-menu-item>
            <el-menu-item index="/home/tags">
              <span>话题广场</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/home/chats">
            <el-icon>
              <ChatLineSquare/>
            </el-icon>
            <span>消息列表</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div v-if="isSmallScreen">
        <el-menu :default-active="router.currentRoute.value.path" mode="horizontal" :ellipsis="false" router>
          <el-sub-menu index="/abc">
            <el-menu-item index="/home/home">
              <span>首页热榜</span>
            </el-menu-item>
            <el-menu-item index="/home/posts">
              <span>帖子列表</span>
            </el-menu-item>
            <el-menu-item index="/home/posts">
              <span>问题列表</span>
            </el-menu-item>
            <el-menu-item index="/home/tags">
              <span>话题广场</span>
            </el-menu-item>
            <el-menu-item index="/home/chats">
              <span>消息列表</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>

      </div>

      <!-- 用户信息，在小屏幕上隐藏 -->
      <div v-if="!isSmallScreen" class="user-info">
        <div class="user-name">{{ userName }}</div>
        <div class="user-email">{{ userEmail }}</div>
      </div>

      <!-- 用户头像 -->
      <div class="user-avatar">
        <el-dropdown>
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="User" @click="goProfile">个人信息</el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
  </el-container>
  <el-main>
    <router-view></router-view>
  </el-main>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {ElMessage} from "element-plus";
import router from "@/router";
import {
  Search,
  Operation,
  Document,
  House,
  ChatLineSquare,
  Tools,
  User,
  SwitchButton,
} from "@element-plus/icons-vue";
import {useStore} from "@/stores/index.js";

const store = useStore();
const userName = store.auth.user.username;
const userEmail = store.auth.user.email;
const isSmallScreen = ref(false);

const handleCommand = async (command) => {
  await router.push(command);
}

// 点击 "北航BBS" 时跳转到首页
const gotoHome = async () => {
  await router.push("/home/home");
};

// 检测窗口大小变化
const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 1000;
};

onMounted(() => {
  updateScreenSize();
  window.addEventListener("resize", updateScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenSize);
});

const logout = () => {
  get('/api/auth/logout', (message) => { // 退出登录成功
    ElMessage.success(message);
    store.auth.user = null;
    localStorage.removeItem('user'); // 删除localStorage中的用户信息
    router.push('/'); // 跳转到登录页面
  });
};

const goProfile = () => {
  router.push('/home/profile/activity');
};

</script>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.content-header {
  background: #ffffff;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px;
}

.content-aside-topShow-logoAndName {
  font-size: 24px;
  font-weight: bold;
  cursor: pointer; /* 增加手型光标 */
}

.content-search {
  flex: 1;
  margin: 0 20px;
}

.content-menu {
  flex: 1;
}

.user-info {
  text-align: right;
  margin: 10px;
}

.user-avatar {
  margin-left: 10px;
  cursor: pointer;
}

/* 小屏幕样式 */
@media (max-width: 768px) {
  .content-menu, .user-info {
    display: none;
  }
}

.el-dropdown-link {
  font-size: 20px;
  color: var(--el-color-primary);
  display: flex;

}
</style>