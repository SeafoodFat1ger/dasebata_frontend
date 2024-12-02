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
        <el-button v-if="userId == myuser.id" type="primary" class="edit-button" @click="editProfile">编辑个人资料
        </el-button>
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
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username"  type="text" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="text"  placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.profile" type="text"  placeholder="请输入简介"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password"  placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
              list-type="picture-card"
              :action="'http://47.93.187.154:8082/posts/uploadImg'"
              :on-change="handleChange"
              :before-remove="beforeRemove"
              :on-preview="handlePictureCardPreview"
              :file-list="fileList.front_file"
              multiple
              :limit="1"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload"
              name="img"
          >
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </div>
    </el-dialog>

    <!-- 预览图片的弹窗 -->
    <el-dialog
        v-model="previewDialogVisible"
        :visible.sync="previewDialogVisible"
        :title="previewTitle"
        :width="'50%'"
        :before-close="handleClosePreview"
    >
      <img
          v-if="previewImage"
          :src="previewImage"
          alt="Preview Image"
          class="preview-image"
      />
    </el-dialog>

    <!-- 页面内容 -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import {useStore} from "@/stores";
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {get, post} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus} from '@element-plus/icons-vue'
import message from "@element-plus/icons/lib/Message.js";
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
        form.username = data.username;
        form.email = data.email;
        form.avatar = data.avatar;
        form.profile = data.profile;
      });
    };

    // 上传图片
    const fileList = ref([]);
    const handleChange = file => {
      if (file.status == "success") {
        fileList.value = [];
        fileList.value.push(file.response);
        form.avatar = file.response.data;
      }
    };
    // 删除
    const beforeRemove = () => {
      const result = new Promise((resolve, reject) => {
        ElMessageBox.confirm("此操作将删除该图片, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
            .then(() => {
              resolve();
              form.avatar = myuser.avatar
            })
            .catch(() => {
              reject(false);
            });
      });
      return result;
    };

    const handleExceed = () => {
      ElMessage("只能上传一张");
    }

    const previewDialogVisible = ref(false);  // 控制预览弹窗显示
    const previewImage = ref('');  // 存储预览的图片
    const previewTitle = ref('图片预览');  // 预览图片的标题

    const handlePictureCardPreview = (file) => {
      // 获取点击的图片，并设置为预览图片
      previewImage.value = file.url || URL.createObjectURL(file.raw);
      previewDialogVisible.value = true; // 打开图片预览弹窗
    };
    const handleClosePreview = () => {
      previewDialogVisible.value = false;
    };

    const beforeUpload = (file) => {
      const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2; // 限制文件大小为 2MB

      if (!isJpgOrPng) {
        ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
        return false
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
        return false
      }

      return isJpgOrPng && isLt2M;  // 如果格式和大小都符合，返回 true 继续上传
    };

    fetchUser();

    const myuser = store.auth.user;
    // 弹窗可见性
    const dialogVisible = ref(false);

    // 表单数据
    const form = reactive({
      username: '',
      email: '',
      avatar: '',
      profile:'',
      password:'',
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
      if(!form.profile || !form.password || !form.email || !form.username){
        ElMessage.warning("请填写完整信息")
        return
      }

      post(`/users/update`, {
            id: myuser.id,
            username: form.username,
            email: form.email,
            password: form.password,
            profile: form.profile,
            avatar: form.avatar,
          },
          (message) => {
            ElMessage.success(message);
            dialogVisible.value = false;
            fetchUser()
            get(`/users/get/${myuser.id}`, (getMessage, getData) => {
              store.auth.user = getData
              localStorage.setItem("user", JSON.stringify(getData))//存在localStorage永久存储
            })
          }
      )


    };

    const router = useRouter()
    const gotoChat = () => {
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
      gotoChat,
      fileList,
      handleChange,
      beforeRemove,
      handleExceed,
      previewDialogVisible,
      previewTitle,
      handleClosePreview,
      previewImage,
      handlePictureCardPreview,
      beforeUpload
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


.hide_box /deep/ .el-upload--picture-card {
  display: none;
}
</style>
