<template>
  <el-container style="height: 100vh;">
    <!-- 左侧菜单 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <span class="logo-text">北航BBS</span>
      </div>

      <div class="logo">
        <el-avatar :src="adminAvatar" size="large" />
      </div>

      <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          background-color="#34495e"
          text-color="#fff"
          active-text-color="#ffd04b"
          @select="handleMenuSelect"
      >
        <el-menu-item index="1" route="/admin/jubao">
          <i class="el-icon-warning"></i>
          举报管理
        </el-menu-item>
        <el-menu-item index="2" route="/admin/post">
          <i class="el-icon-postcard"></i>
          帖子管理
        </el-menu-item>
        <el-menu-item index="3" route="/admin/user">
          <i class="el-icon-setting"></i>
          用户
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区域 -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElContainer, ElAside, ElMenu, ElMenuItem, ElAvatar, ElMain } from 'element-plus';
import {useStore} from "@/stores/index.js";

export default {
  name: 'AdminMenu',
  components: {
    ElContainer,
    ElAside,
    ElMenu,
    ElMenuItem,
    ElAvatar,
    ElMain,
  },
  setup() {
    const store = useStore();
    const adminAvatar = store.auth.user.avatar; // 管理员头像路径
    const isCollapse = ref(false); // 菜单是否折叠
    const router = useRouter();

    const handleMenuSelect = (index) => {
      const routes = {
        1: '/admin/jubao',
        2: '/admin/post',
        3: '/admin/user',
      };
      const routePath = routes[index];
      router.push(routePath);
    };

    return {
      adminAvatar,
      isCollapse,
      handleMenuSelect,
    };
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #2c3e50;
  padding: 20px;
  color: white;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo-text {
  font-size: 20px;
  margin-left: 10px;
}

.admin-info {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.admin-name {
  margin-left: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.el-menu {
  margin-top: 10px;
}

.el-menu-item {
  font-size: 16px;
}

.el-menu-item i {
  margin-right: 10px;
}

.el-avatar {
  margin-right: 10px;
}

.el-main {
  padding: 20px;
}
</style>
