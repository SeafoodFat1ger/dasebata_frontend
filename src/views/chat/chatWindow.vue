<template>
  <div class="el_main_content">
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
              <span>{{ item.message }}</span>
            </div>
            <img :src="myuser.avatar" alt="wo" class="avatar">
          </div>
          <div v-if="item.from === '他'" class="answer chat">
            <img :src="user.avatar" alt="ta" class="avatar">
            <div class="chat_answer chat_common">
              <span>{{ item.message }}</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="main_content_footer">
      <div class="input_box">
        <textarea class="chat-input no-border" v-model="question"/>
      </div>
      <div class="btn_box">
        <el-button type="primary" class="btn" @click="askClick(question)">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, computed, watch} from "vue";
import {ElMessage} from "element-plus";
import {get, post} from "@/net/index.js";
import {useRoute} from "vue-router";
import {useStore} from "@/stores/index.js";

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
  });
};

const fetchHistoryMessages = () => {
  if (loadingMessages.value) return; // 如果当前正在加载消息，直接返回
  loadingMessages.value = true;

  get(`/chats/getChats/${userId}/${myuser.id}/${currentPage.value}/${pageSize.value}`, (message, data) => {
    totalMessages.value = data.total; // 总消息数
    if (data.records && data.records.length > 0) {
      chatList.value = [...data.records.map(formatMessage), ...chatList.value]; // 在顶部加载新数据
    }
    if (data.total <= chatList.value.length) {
      showLoadMore.value = false;
    }
    loadingMessages.value = false; // 加载完成
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
      question.value = ""; // 发送后清空输入框
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
  currentPage.value++; // 增加页码
  fetchHistoryMessages(); // 加载更多聊天记录
};

let intervalId = null; // 页面加载时初始化历史消息

onMounted(() => {
  chatList.value = []; // 清空历史记录
  currentPage.value = 1; // 重置页码为 1
  fetchUser();
  fetchHistoryMessages(); // 加载初始历史消息
  intervalId = setInterval(() => {
    chatList.value = []; // 清空历史记录
    currentPage.value = 1; // 重置页码为 1
    fetchHistoryMessages(); // 定时刷新聊天记录
  }, 60000); // 60秒
  scrollToBottom();
});

// 格式化时间显示
const formatSendTime = (sendTime) => {
  const now = new Date();
  const sendDate = new Date(sendTime);
  const timeDiff = now - sendDate;
  const oneDay = 24 * 60 * 60 * 1000;

  if (timeDiff < oneDay) {
    return `今天 ${formatTime(sendDate)}`;
  } else if (timeDiff < 7 * oneDay) {
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
      userId = newUserId;  // 更新 userId
      fetchUser();  // 重新获取用户信息
      currentPage.value = 1; // 重置分页页码
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
  height: 700px;
  width: 600px;

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

/* Time display for chat */
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
</style>
