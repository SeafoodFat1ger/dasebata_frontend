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
        <div v-if="!wuxiao">
        <button v-if="userId == myuser.id" type="primary" class="edit-button" @click="editProfile">编辑个人资料
        </button>
        <div class="action-buttons">
          <button v-if="userId != myuser.id" type="primary" class="edit-button" @click="gotoChat">去私信</button>
          <button v-if="userId != myuser.id" @click="openJuDialog('user')" class="edit-button">
            <span class="icon">⚠️</span>举报
          </button>
        </div>
        </div>
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
          <el-input v-model="form.username" type="text" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="text" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.profile" type="text" placeholder="请输入简介"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
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
      <!--举报-->
      <div v-if="showJuDialog" class="reply-dialog">
        <div class="dialog-content">
          <el-form :model="form1">
            <el-form-item label="举报对象">
              <el-tag>{{ form1.reportType }}</el-tag>
            </el-form-item>
            <el-form-item label="举报原因">
              <el-select
                  v-model="form1.reason"
                  placeholder="请选择"
              >
                <el-option label="血腥暴力" value="1"/>
                <el-option label="低俗色情" value="2"/>
                <el-option label="造谣生事" value="3"/>
                <el-option label="恶意攻击" value="4"/>
                <el-option label="垃圾信息" value="5"/>
              </el-select>
            </el-form-item>
          </el-form>

          <myEditor @update:content="updateJuContent"/>

          <div class="dialog-actions">
            <button @click="closeJuDialog" class="cancel-btn">取消</button>
            <button @click="submitJu" class="submit-btn">提交</button>
          </div>
        </div>
      </div>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import {useStore} from "@/stores";
import {reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {get, post} from "@/net/index.js";
import {ElMessage, ElMessageBox, ElTag} from "element-plus";
import {Plus} from '@element-plus/icons-vue'
import message from "@element-plus/icons/lib/Message.js";
import router from "@/router/index.js";
import myEditor from "@/components/Editor.vue";

const store = useStore();
export default {
  components: {ElTag, myEditor},
  setup() {
    const route = useRoute();
    const userId = route.params.userId; // 获取当前用户的ID
    const user = ref({});

    const wuxiao = ref(false);

    const fetchUser = () => {
      get(`/users/get/${userId}`, (message, data) => {
        user.value = data;
        form.username = data.username;
        form.email = data.email;
        form.avatar = data.avatar;
        form.profile = data.profile;
      }, error, error);
    };

    const error = () => {
      wuxiao.value = true;
      user.value = {
        "id": 1,
        "username": "用户不存在",
        "email": "buaaer@mars.com",
        "password": "",
        "createdAt": "火星的访客",
        "lastLogin": "火星的访客",
        "profile": "简介",
        "avatar": "http://47.93.187.154:8082/imgview/1733674414290error.png",
      }

    }


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
      profile: '',
      password: '',
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
      if (!form.profile || !form.password || !form.email || !form.username) {
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

    const form1 = reactive({
      reportType: 'post',
      reason: '',
      message: '',
    })

    const showJuDialog = ref(false)
    const openJuDialog = (reportType) => {
      form1.reportType = reportType
      showJuDialog.value = true; // 显示对话框
    };
    const closeJuDialog = () => {
      showJuDialog.value = false; // 关闭对话框
    };

    const submitJu = async () => {
      if (form1.message === '') {
        ElMessage.warning("评论内容不能为空");
        return;
      }
      const replyData = {
        reportType: form1.reportType,
        reason: form1.reason,
        message: form1.message,
        userId: myuser.id,
        targetId: userId,
      };
      console.log(replyData);
      post(`/posts/addReport`, replyData,
          (message, data) => {
            ElMessage.success("举报成功");
            closeJuDialog(); // 关闭对话框
          }
      )
    }
    const updateJuContent = async (newContent) => {
      form1.message = newContent; // 更新父组件的内容
    };

    return {
      wuxiao,
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
      beforeUpload,
      form1, showJuDialog, submitJu, closeJuDialog, openJuDialog, updateJuContent
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
  padding: 10px 20px;
  font-size: 10px;
  color: white;
  background: linear-gradient(145deg, #6e7dff, #599aff); /* 渐变背景 */
  border: none;
  border-radius: 30px; /* 圆角按钮 */
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 外阴影 */
  transition: all 0.3s ease-in-out; /* 动画过渡 */
  width: 150px;
}

.edit-button:hover {
  background: linear-gradient(145deg, #3f53d8, #6e7dff); /* 悬停时背景色反转 */
  transform: scale(1.05); /* 放大效果 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 悬停时增加阴影 */
}

.edit-button:active {
  background: #4a63d8; /* 按下时的背景颜色 */
  transform: scale(1); /* 按下时恢复大小 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); /* 按下时减少阴影 */
}

.edit-button:focus {
  outline: none; /* 去掉聚焦时的默认边框 */
  box-shadow: 0 0 5px 2px rgba(108, 124, 255, 0.5); /* 聚焦时的光圈效果 */
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

.reply-dialog {
  padding-top: 30px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background-color: #D6DDE5FF;
  padding: 20px;
  width: 80%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  resize: none;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.dialog-actions button {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-actions button:hover {
  background-color: #3077C1;
}

.action-buttons {
  display: flex; /* 使用 flex 布局 */
  gap: 10px; /* 按钮之间的间距 */
  align-items: center; /* 垂直居中 */
}

</style>
