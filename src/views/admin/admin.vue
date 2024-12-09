<template>
  <el-container style="height: 100vh;">
    <!-- 侧边栏 -->
    <el-aside width="250px" class="sidebar">
      <el-menu
          :default-active="activePath"
          background-color="#2f3b52"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          :router="true"
      >
        <div class="logo">
          <span class="logo-text">北航BBS</span>
        </div>

        <div class="logo">
          <el-avatar :src="adminAvatar" size="large" />
        </div>

        <el-menu-item index="/admin/jubao" :route="{ path: '/admin/jubao' }">
          <el-icon><Message /></el-icon>
          <span slot="title">举报管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/post" :route="{ path: '/admin/post' }">
          <el-icon><EditPen /></el-icon>
          <span slot="title">帖子管理</span>
        </el-menu-item>

        <el-menu-item index="home" @click="handleHome">
          <el-icon><House /></el-icon>
          <span slot="title">返回前台</span>
        </el-menu-item>

        <!-- 退出登录按钮 -->
        <el-menu-item index="logout" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span slot="title">退出登录</span>
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
import {ElContainer, ElAside, ElMenu, ElMenuItem, ElAvatar, ElMain, ElMessage} from 'element-plus';
import { useStore } from "@/stores/index.js";
import {SwitchButton,EditPen,Message,House} from "@element-plus/icons-vue";
export default {
  name: "AdminMenu",
  components: {
    ElContainer,
    ElAside,
    ElMenu,
    ElMenuItem,
    ElAvatar,
    ElMain,
    SwitchButton,EditPen,Message,House
  },
  setup() {
    const store = useStore();
    const adminAvatar = store.auth.user.avatar; // 管理员头像路径
    const isCollapse = ref(false); // 菜单是否折叠
    const router = useRouter();

    // 获取当前路由的路径
    const activePath = router.currentRoute.value.path;


    const handleLogout = () => {
      store.auth.user = null;
      localStorage.removeItem('user');
      ElMessage.success("退出登录成功");
      router.push('/');
    }

    const handleHome = () => {
      router.push("/home/home");
    }

    return {
      adminAvatar,
      isCollapse,
      activePath,
      handleLogout,handleHome
    };
  }
};
</script>

<style scoped>
.sidebar {
  background-color: #2f3b52;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo-text {
  font-size: 20px;
  margin-left: 10px;
  color: #ffffff;
}
</style>
