<template>

  <div class="el_main_content">
    <div class="main_content_header">{{ user.username }}</div>
    <div class="main_content_center">
      <el-scrollbar class="faultExpertConsultation_scrollbar" ref="scrollbarRef">
        <!-- 对话内容 -->
        <div v-for="(item, index) in messagesWithTimestamps" :key="index" v-show="messagesWithTimestamps.length > 0">
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
import {ref, onMounted, onBeforeUnmount, nextTick, computed, watch} from "vue";
import {ElMessage} from "element-plus";
import axios from "axios";
import {useRoute} from "vue-router";
import {get, post} from "@/net/index.js";
import {useStore} from "@/stores/index.js";
import message from "@element-plus/icons/lib/Message.js";

const question = ref(""); // 输入框值
const chatList = ref([]); // 循环的聊天数组
const scrollbarRef = ref(null);

const store = useStore();
const route = useRoute();
let userId = route.params.userId; // 获取当前用户的ID
const user = ref({});

// 获取用户信息
const fetchUser = () => {
  get(`/users/get/${userId}`, (message, data) => {
    user.value = data;
  });
};

fetchUser();


const myuser = store.auth.user; // 获取当前登录的用户

// 获取历史消息
const fetchHistoryMessages = async () => {

  get(`/chats/getChats/${userId}/${myuser.id}`, (message, data) => {
        chatList.value = data.map(item => ({
          message: item.message,
          timestamp: item.createdAt,
          from: item.fromId === myuser.id ? '我' : '他', // 根据 fromId 判断发信人
          to: item.toId === myuser.id ? '我' : '他',     // 根据 toId 判断收信人
          showTime: false,  // 默认不显示时间
        }));
      }
  )
}

// 创建新的对话数组，加上属性showTime
const messagesWithTimestamps = computed(() => {
  return chatList.value.map((item, index) => ({
    ...item,
    showTime: index === 0 || shouldShowTime(index),
  }));
});

// 计算两次会话时间是否超过3分钟
const shouldShowTime = (index) => {
  const current = new Date(chatList.value[index - 1].timestamp);
  const next = new Date(chatList.value[index].timestamp);
  const diff = next ? next - current : 0;
  return diff > 3 * 60 * 1000; // 如果间隔超过3分钟返回true
};

// 提问方法
const askClick = async (val) => {
  if (val !== "") {

    //TODO 这个接口有问题
    post(`/chats/add`, {
          message: val,
          fromId: myuser.id, // 当前登录用户的ID
          toId: userId,
        },
        (message, data) => {
          question.value = ""; // 清空输入框
        }
    )

  } else {
    ElMessage("不能发送空白消息");
  }
};

// 滚动事件到底部事件
const scrollToBottom = () => {
  nextTick(() => {
    let chat = document.querySelector(".main_content_center");
    scrollbarRef.value.wrapRef.scrollTop = chat.scrollHeight;
  });
};

// 监听聊天记录变化，自动滚动到底部
watch(
    chatList.value,
    (newVal, oldVal) => {
      scrollToBottom();
    },
    {immediate: true}
);


watch(
    () => route.params.userId,  // 监听路由参数的变化
    (newUserId) => {
      userId = newUserId;  // 更新 userId
      fetchUser();  // 重新获取用户信息
      fetchHistoryMessages();  // 重新获取历史消息
    },
    {immediate: true}
);


// 格式化时间
const formatSendTime = (sendTime) => {
  const now = new Date();
  const sendDate = new Date(sendTime);

  if (isNaN(sendDate)) {
    console.error("Invalid date:", sendTime);
    return "Invalid time";
  }

  const timeDiff = now - sendDate;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTargetDate = new Date(sendDate.getFullYear(), sendDate.getMonth(), sendDate.getDate());
  const oneDay = 24 * 60 * 60 * 1000;

  if (startOfToday.getTime() === startOfTargetDate.getTime()) {
    return formatTime(sendDate);
  }

  if (timeDiff < oneDay) {
    return "昨天 " + formatTime(sendDate);
  }

  if (timeDiff < 7 * oneDay) {
    const weekday = getWeekday(sendDate);
    return weekday + " " + formatTime(sendDate);
  }

  return (
      sendDate.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) + " " + formatTime(sendDate)
  );
};

const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return hours + ":" + minutes;
};

const getWeekday = (date) => {
  const weekdays = [
    "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六",
  ];
  return weekdays[date.getDay()];
};

// 页面加载时初始化历史消息，并启动定时获取历史消息
let intervalId = null;

onMounted(() => {
  fetchHistoryMessages();  // 页面加载时获取一次历史消息

  // 设置每5秒获取一次历史消息
  intervalId = setInterval(fetchHistoryMessages, 5000000);
});

// 在组件销毁时清除定时器
onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style>
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
