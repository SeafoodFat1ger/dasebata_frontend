<template>
  <div v-if="!wuxiao" class="el_main_content">
    <div class="main_content_header">
      <span class="username">{{ user.username }}</span>
    </div>

    <div class="main_content_center">
      <el-scrollbar class="faultExpertConsultation_scrollbar" ref="scrollbarRef" @scroll="onScroll">
        <!-- 查看更多历史记录按钮 -->
        <div v-if="showLoadMore" class="load-more-btn">
          <el-button @click="loadMoreHistory" type="text" size="small" class="load-more-btn-text">
            ——————查看更多历史记录——————
          </el-button>
        </div>

        <!-- 对话内容 -->
        <div v-for="(item, index) in messagesWithTimestamps" :key="index">
          <div v-if="item.showTime" class="chat_time">
            {{ formatSendTime(item.timestamp) }}
          </div>
          <div v-if="item.from === '我'" class="question chat">
            <div class="chat_question chat_common">
              <!-- 如果消息是图片链接，渲染为图片 -->
              <img v-if="isImageUrl(item.message)" :src="item.message" class="message-image"/>
              <!-- 否则渲染为文本 -->
              <span v-else>{{ item.message }}</span>
            </div>
            <img :src="myuser.avatar" alt="wo" class="avatar">
          </div>
          <div v-if="item.from === '他'" class="answer chat">
            <img :src="user.avatar" alt="ta" class="avatar">
            <div class="chat_answer chat_common">
              <!-- 如果消息是图片链接，渲染为图片 -->
              <img v-if="isImageUrl(item.message)" :src="item.message" class="message-image"/>
              <!-- 否则渲染为文本 -->
              <span v-else>{{ item.message }}</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

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

    <!-- 评论对话框 -->
    <div v-if="showReplyDialog" class="reply-dialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <span class="dialog-title">上传图片</span>
        </div>
        <div class="dialog-body">
          <el-form :model="form">
            <el-form-item label="图片" class="upload-item">
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
        </div>
        <div class="dialog-actions">
          <button @click="closeReplyDialog" class="cancel-btn">取消</button>
          <button @click="askClick(form.avatar)" class="submit-btn">提交</button>
        </div>
      </div>
    </div>


    <div class="main_content_footer">
      <div class="input_box">
        <textarea class="chat-input no-border" v-model="question"/>
      </div>
      <div class="btn_box">
        <el-button type="primary" class="btn" @click="openReplyDialog">发送图片</el-button>
        <el-button type="primary" class="btn" @click="askClick(question)">发送</el-button>
      </div>
    </div>

  </div>

  <div v-if="wuxiao" class="el_main_content" :style="wuxiao ? { backgroundColor: '#ffffff' } : {}">
    <div class="wuxiao-content">
      <p class="wuxiao-text">你来到了没有知识的荒原</p>
      <el-button type="primary" @click="goHome" class="go-home-btn">跳转首页</el-button>
      <img src="http://47.93.187.154:8082/imgview/1733674414290error.png">
    </div>
  </div>

</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed, watch, reactive} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {get, post} from "@/net/index.js";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "@/stores/index.js";
import myEditor from "@/components/Editor.vue";

const question = ref(""); // 输入框值
const chatList = ref([]); // 聊天记录数组
const scrollbarRef = ref(null);

const store = useStore();
const route = useRoute();
let userId = route.params.userId;
const user = ref({});

const currentPage = ref(1);
const pageSize = ref(10);
const totalMessages = ref(0);
const loadingMessages = ref(false); // 防止重复加载消息
const showLoadMore = ref(false);

const myuser = store.auth.user; // 当前登录用户

const fetchUser = () => {
  get(`/users/get/${userId}`, (message, data) => {
    user.value = data;
  }, error, error);
};

const wuxiao = ref(false);

const error = () => {
  wuxiao.value = true;
}

const router = useRouter()
const goHome = () => {
  router.push(`/home/home`);
};

const form = reactive({
  avatar: '',

})

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
          form.avatar = '';
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
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }

  return isJpgOrPng && isLt2M;  // 如果格式和大小都符合，返回 true 继续上传
};


const showReplyDialog = ref(false);
const openReplyDialog = () => {
  showReplyDialog.value = true;
};
const closeReplyDialog = () => {
  showReplyDialog.value = false;
};
const isImageUrl = (message) => {
  return message.startsWith('http://47.93.187.154:8082/imgview/');
};

const fetchHistoryMessages = () => {
  if (loadingMessages.value) return; // 如果当前正在加载消息，直接返回
  loadingMessages.value = true;

  get(`/chats/getChats/${userId}/${myuser.id}/${currentPage.value}/${pageSize.value}`, (message, data) => {
    totalMessages.value = data.total;
    if (data.records && data.records.length > 0) {
      chatList.value = [...data.records.map(formatMessage), ...chatList.value];
    }
    if (data.total <= chatList.value.length) {
      showLoadMore.value = false;
    }
    loadingMessages.value = false;
  });
};

const formatMessage = (item) => ({
  message: item.message,
  timestamp: item.createdAt,
  from: item.fromId === myuser.id ? '我' : '他',
  to: item.toId === myuser.id ? '我' : '他',
  showTime: false,
});

const messagesWithTimestamps = computed(() => {
  return chatList.value.map((item, index) => ({
    ...item,
    showTime: index === 0 || shouldShowTime(index),
  }));
});

const shouldShowTime = (index) => {
  if (index === 0) return true;
  const current = new Date(chatList.value[index - 1].timestamp);
  const next = new Date(chatList.value[index].timestamp);
  return next - current > 3 * 60 * 1000;
};

const askClick = (val) => {
  if (val !== "") {
    post(`/chats/add`, {
      message: val,
      fromId: myuser.id,
      toId: userId,
    }, (message, data) => {
      question.value = "";
      chatList.value = [];
      currentPage.value = 1;
      fetchHistoryMessages();
    });
  } else {
    ElMessage("不能发送空白消息");
  }
};

const onScroll = () => {
  const scrollbar = scrollbarRef.value.wrapRef;
  if (scrollbar.scrollTop < 100 && chatList.value.length < totalMessages.value) {
    showLoadMore.value = true;  // 滚动到顶部时显示"查看更多历史记录"按钮
  } else {
    showLoadMore.value = false; // 滚动到底部时隐藏按钮
  }
};

const loadMoreHistory = () => {
  currentPage.value++;
  fetchHistoryMessages();
};

let intervalId = null;

onMounted(() => {
  chatList.value = [];
  currentPage.value = 1;
  fetchUser();
  fetchHistoryMessages();
  intervalId = setInterval(() => {
    chatList.value = [];
    currentPage.value = 1;
    fetchHistoryMessages(); // 定时刷新聊天记录
  }, 60000);
  scrollToBottom();
});

// 格式化时间显示
const formatSendTime = (sendTime) => {
  const now = new Date();
  const sendDate = new Date(sendTime);

  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sendDateAtMidnight = new Date(sendDate.getFullYear(), sendDate.getMonth(), sendDate.getDate());

  const timeDiff = now - sendDateAtMidnight;
  const oneDay = 24 * 60 * 60 * 1000;

  if (timeDiff < oneDay) {
    return `今天 ${formatTime(sendDate)}`;
  } else if (timeDiff < 2 * oneDay) {
    return `昨天 ${formatTime(sendDate)}`;
  } else {
    return sendDate.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }) + " " + formatTime(sendDate);
  }
};

const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// 滚动到底部的方法
const scrollToBottom = () => {
  const scrollbar = scrollbarRef.value.wrapRef;
  if (scrollbar) {
    scrollbar.scrollTop = scrollbar.scrollHeight;
  }
};

watch(
    () => route.params.userId,  // 监听路由参数变化
    (newUserId) => {
      userId = newUserId;
      fetchUser();
      currentPage.value = 1;
      chatList.value = []
      fetchHistoryMessages()
    },
    {immediate: true}
);

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.no-border {
  border: none;
  outline: none;
  resize: none;
}

/* Load more button */
.load-more-btn {
  text-align: center;
  margin-top: 10px;
}

.load-more-btn-text {
  font-size: 14px;
  color: #656565;
  font-weight: 500;
}

.load-more-btn-text:hover {
  text-decoration: underline;
}

</style>

<style lang="less" scoped>
.el_main_content {
  background-color: #f4f7fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 85vh;
  width: 100%;

  display: flex;
  flex-direction: column;
}

.main_content_header {
  background: linear-gradient(135deg, rgba(194, 214, 246, 0.44), #F3D5FF82); /* 渐变背景 */
  padding: 15px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 8px;
}

.username {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.main_content_center {
  width: 100%;
  height: 80%;
  margin: 10px 0;
  overflow-y: auto;
  flex: 1;
  padding: 5px;
}

.chat_time {
  font-size: 12px;
  color: #888;
  text-align: center;
  margin: 15px 0;
}

.question {
  justify-content: flex-end;
}

.chat_question {
  background-color: #409eff;
  margin-right: 5px;
  color: #ffffff;
}

.chat_answer {
  background-color: #f2f3f5;
  margin-left: 5px;
}

.chat {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-end;
}

.chat_common {
  background-color: #fff;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 70%;
  word-wrap: break-word;
}

.chat_question {
  background: linear-gradient(135deg, #EEF4FF70, #F3D5FFC2);
  color: #333;
  margin-right: 15px;
}

.chat_answer {
  background: linear-gradient(135deg, #A1BEEE9B, #EEF6FF81);
  color: #333;
}

.me {
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
}

.main_content_footer {
  width: 100%;
  height: 100px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.input_box {
  flex: 1;
}

.chat-input {
  width: 100%;
  min-height: 50px;
  padding: 15px 25px;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  background-color: #f9f9f9;
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.chat-input:focus {
  border-color: #007bff;
}

.btn_box {
  margin-left: auto;

}

.btn {
  background-color: rgba(215, 158, 241, 0.6);
  color: #313131;
  border-radius: 20px;
  padding: 15px 20px;
  font-weight: 600;
  border: #071f47 10px;
}

.btn:hover {
  background-color: #B181C799;
}

.faultExpertConsultation_scrollbar {
  max-height: calc(100vh - 220px);
  padding-right: 10px;
}

.avatar {
  border: 1px solid #484848;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* 回复对话框容器 */
.reply-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 对话框内容 */
.dialog-content {
  background: white;
  border-radius: 12px;
  width: 450px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 对话框头部 */
.dialog-header {
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 15px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 对话框内容区域 */
.dialog-body {
  flex-grow: 1;
  padding-bottom: 20px;
}

.upload-item {
  margin-bottom: 0;
}

/* 按钮区域 */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 取消按钮样式 */
.cancel-btn {
  background-color: #f4f6f8;
  border: 1px solid #e4e7ed;
  color: #B181C799;
  border-radius: 25px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e4f4ff;
  border-color: #B181C799;
}

/* 提交按钮样式 */
.submit-btn {
  background-color: rgba(215, 158, 241, 0.6);
  border: none;
  color: #313131;
  border-radius: 25px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #B181C799;
  transform: translateY(-2px);
}

.message-image {
  max-width: 300px;
  max-height: 200px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 10px;
}


.full-screen-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.full-screen-image img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}


.wuxiao-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.wuxiao-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.go-home-btn {
  font-size: 16px;
}
</style>
