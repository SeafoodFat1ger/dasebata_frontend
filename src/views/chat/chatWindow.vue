<template>
  <div class="el_main_content">
    <div class="main_content_header">{{ user.username }}</div>
    <div class="main_content_center">
      <el-scrollbar class="faultExpertConsultation_scrollbar" ref="scrollbarRef" @scroll="onScroll">
        <!-- 对话内容 -->
        <div v-for="(item, index) in messagesWithTimestamps" :key="index">
          <!-- 对话时间 -->
          <div v-if="item.showTime" class="chat_time">
            {{ formatSendTime(item.timestamp) }}
          </div>
          <!-- 判断是提问还是回答 -->
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
let userId = route.params.userId; // 当前用户ID
const user = ref({});

const currentPage = ref(1); // 当前页
const pageSize = ref(20);   // 每页消息条数
const totalMessages = ref(0); // 总消息数
const loadingMessages = ref(false); // 防止重复加载消息

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
    });
  } else {
    ElMessage("不能发送空白消息");
  }
};

const onScroll = () => {
  const scrollbar = scrollbarRef.value.wrapRef;
  if (scrollbar.scrollTop === 0 && chatList.value.length < totalMessages.value) {
    currentPage.value++; // 增加页码
    fetchHistoryMessages(); // 加载更多聊天记录
  }
};
let intervalId = null; // 页面加载时初始化历史消息

onMounted(() => {
  chatList.value = []; // 清空历史记录
  currentPage.value = 1; // 重置页码为 1
  fetchUser();
  fetchHistoryMessages(); // 加载初始历史消息
  // 设置定时器，每60秒（或你希望的时间）刷新聊天记录
  intervalId = setInterval(() => {
    chatList.value = []; // 清空历史记录
    currentPage.value = 1; // 重置页码为 1
    fetchHistoryMessages(); // 定时刷新聊天记录
  }, 6000); // 60秒
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
  // 清理任何可能的定时器或其他资源
});
</script>

<style scoped>
.no-border {
  border: none;
  outline: none;
  resize: none;
}
</style>

<style lang="less" scoped>
.el_main_content {
  width: 80%;
  height: 80vh;
  border-radius: 5px;
  border: 1px solid #e4e7ed;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  margin: auto;
}

.main_content_header {
  width: 100%;
  height: 50px;
  border-radius: 5px;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.main_content_center {
  width: 100%;
  height: calc(100% - 170px);
  margin: 10px 0;
  overflow-y: auto;
  padding-right: 10px;
}

.chat_time {
  display: flex;
  justify-content: center;
  font-size: 10px;
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
  width: 98%;
  margin: 10px auto;
  display: flex;
}

.chat_common {
  max-width: 40%;
  padding: 10px;
  border-radius: 2px;
  word-break: break-all;
  display: flex;
  align-items: center;
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
  width: 100%;
  height: 60px;

  .chat-input {
    width: 100%;
    padding: 10px;
    margin: auto;
    resize: none;
  }
}

.btn_box {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.faultExpertConsultation_scrollbar {
  max-height: calc(100vh - 220px);
}

.avatar {
  background-color: #409eff;
  border: 2px solid #409eff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
