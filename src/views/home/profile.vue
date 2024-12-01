<template>
  <el-container class="content">
    <!-- 用户信息和头像 -->
    <div class="user-container">
      <!-- 用户信息部分 -->
      <div class="user-info-left">
        <div class="username">{{ user.username }}</div>
        <div class="email">{{ user.email }}</div>
        <div class="last-login">
          最后一次登录时间：{{ formatLastLogin(user.lastLogin) }}
        </div>
        <el-button v-if="userId == myuser.id" type="primary" class="edit-button" @click="editProfile">编辑个人资料</el-button>
        <el-button v-if="userId != myuser.id" type="primary" class="edit-button" @click="gotoChat">去私信</el-button>

      </div>

      <!-- 头像部分 -->
      <div class="user-info-right">
        <img :src="user.avatar" alt="User Avatar" class="avatar">
      </div>
    </div>

    <!-- 菜单 -->
    <el-menu :default-active="this.$route.path" mode="horizontal" :ellipsis="false" router class="menu">
      <el-menu-item :index="`/home/profile/${userId}/activity`">
        <span>我的帖子</span>
      </el-menu-item>
      <el-menu-item :index="`/home/profile/${userId}/guan`">
        <span>我的提问</span>
      </el-menu-item>
      <el-menu-item :index="`/home/profile/${userId}/likes`">
        <span>我的喜欢</span>
      </el-menu-item>
      <el-menu-item :index="`/home/profile/${userId}/stars`">
        <span>我的收藏</span>
      </el-menu-item>
    </el-menu>

    <el-dialog title="编辑个人资料" v-model="dialogVisible" width="600px">
      <el-form :model="form" ref="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="头像">

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </div>
    </el-dialog>

    <!-- 页面内容 -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import {useStore} from "@/stores";
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {get} from "@/net/index.js";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

const store = useStore();
export default {
  setup() {
    const route = useRoute();
    const userId = route.params.userId; // 获取当前用户的ID
    const user = ref({});
    const fetchUser = () => {
      get(`/users/get/${userId}`, (message, data) => {
        user.value = data;
      });
    };

    fetchUser();

    const myuser = store.auth.user;
    // 弹窗可见性
    const dialogVisible = ref(false);

    // 表单数据
    const form = ref({
      username: myuser.username,
      nickname: "", // 可以在此处添加昵称字段
      avatar: myuser.avatar, // 头像预览
      avatarFile: null, // 用于保存文件对象
    });

    const formatLastLogin = (dateString) => {
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      return date.toLocaleString('zh-CN', options); // 根据需求调整格式
    };

    const editProfile = () => {
      dialogVisible.value = true;
    };

    const saveProfile = () => {
      dialogVisible.value = false;
    };

    const router = useRouter()
    const gotoChat = () =>{
      router.push(`/home/chats/${userId}`);
    }

    return {
      user,
      userId,
      myuser,
      dialogVisible,
      form,
      editProfile,
      formatLastLogin,
      saveProfile,
      gotoChat
    };
  }
};
</script>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.user-container {
  display: flex; /* 使用 flex 布局 */
  justify-content: space-between; /* 使头像和信息分开 */
  align-items: center; /* 让头像和用户信息垂直居中 */
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.user-info-left {
  flex: 1; /* 用户信息占据大部分空间 */
  display: flex;
  flex-direction: column; /* 垂直排列用户信息 */
  margin-right: 20px; /* 头像和信息之间的间距 */
}

.user-info-right {
  flex: 0 0 120px; /* 固定头像宽度 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.email, .last-login {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.edit-button {
  width: 150px;
  margin-top: 10px;
}

.content {
  padding-top: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.menu {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.el-menu {
  flex: 1;
}
</style>
