<template>
  <div style="width: 100vw;height: 100vh;overflow: hidden;display: flex">
    <!--左侧壁纸固定-->
    <div style="flex:1">
      <img style="width: 100%;height: 100%" fit ="cover" src="../assets/logo.png"/>
    </div>
    <div class="welcome-title">
      <div style="font-size: 30px;font-weight: bold">欢迎来到我们的论坛</div>
      <div style="margin-top: 10px">这是数据库大作业</div>
      <div style="margin-top: 5px">更是我们的自由之地</div>
    </div>
    <!--右侧-->
    <div style="width: 450px;text-align: center;background-color: white;z-index: 1">
      <router-view v-slot = "{Component}">
        <transition name="el-fade-in-linear">
          <component :is="Component" style="height: 100%"/>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import {useStore} from "@/stores/index.js";
import router from "@/router/index.js";

const store = useStore();
const user = store.auth.user || JSON.parse(localStorage.getItem('user'));

// 如果用户已登录，则直接跳转到 home 页面
if (user) {
  router.push({ name: 'homee' });
}
</script>

<style scoped>
.welcome-title{
  position: absolute;
  bottom: 30px;
  left: 30px;
  color: white;
  text-shadow: 0 0 10px black;
}
</style>