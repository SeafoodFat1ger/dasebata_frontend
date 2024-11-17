<template>
  <el-container style="height: 100vh;" ref="bodyform">
    <div class="el_main_content">
      <div class="main_content_header">这是一个对话框</div>
      <div class="main_content_center">
        <el-scrollbar
            class="faultExpertConsultation_scrollbar"
            ref="scrollbarRef"
        >
          <!-- 对话内容 -->
          <div
              v-for="(item, index) in messagesWithTimestamps"
              :key="index"
              v-show="messagesWithTimestamps.length > 0"
          >
            <!-- 对话时间 -->
            <div v-if="item.showTime" class="chat_time">
              {{ formatSendTime(item.timestamp) }}
            </div>
            <!-- 判断是提问还是回答 -->
            <div v-if="item.from === '用户'" class="question chat">
              <div class="chat_question chat_common">
                <span>{{ item.message }}</span>
              </div>
              <el-avatar class="avatar">
                <span class="me">我</span>
              </el-avatar>
            </div>
            <div v-if="item.from === '机器人'" class="answer chat">
              <el-avatar :src="robot" />
              <div class="chat_answer chat_common">
                <span>{{ item.message }}</span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="main_content_footer">
        <div class="input_box">
          <textarea class="chat-input no-border" v-model="question" />
        </div>
        <div class="btn_box">
          <el-button type="primary" class="btn" @click="askClick(question)">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios"; // 导入axios

const question = ref(""); // 输入框值
const chatList = ref([]); // 循环的聊天数组
const scrollbarRef = ref(null);

//TODO 轮询
// 获取历史聊天记录
const fetchHistoryMessages = async () => {
  // try {
  //   const response = await axios.get("/api/get-history-messages", {
  //     params: { limit: 10 },
  //   });
  //   chatList.value = response.data.messages;
  // } catch (error) {
  //   ElMessage.error("加载历史消息失败");
  // }
  //TODO 接口
  chatList.value = [
    {
      "message": "密码的写不完了啊",
      "timestamp": "2024-11-10T10:00:00",
      "to": "机器人",
      "from": "用户"
    },
    {
      "message": "我草啊啊啊啊啊啊啊啊啊啊啊",
      "timestamp": "2024-11-17T10:00:10",
      "to": "机器人",
      "from": "用户"
    },
    {
      "message": "没事哒没事哒",
      "timestamp": "2024-11-17T10:01:00",
      "to": "用户",
      "from": "机器人"
    }
  ];

};

// 创建新的对话数组，加上属性showTime
const messagesWithTimestamps = computed(() => {
  return chatList.value.map((item, index) => ({
    ...item,
    showTime: index === 0 || shouldShowTime(index),
  }));
});

// 计算两次会话时间是否超过3分钟方法
const shouldShowTime = (index) => {
  const current = new Date(chatList.value[index - 1].timestamp);
  const next = new Date(chatList.value[index].timestamp);
  const diff = next ? next - current : 0;
  return diff > 3 * 60 * 1000; // 如果间隔超过3分钟返回true
};

// 提问方法
const askClick = async (val) => {
  if (val !== "") {
    // 发送提问到后端
    try {
      //TODO 接口
      // 更新聊天记录
      chatList.value.push({
        message: val, // 提问内容
        timestamp: new Date().toISOString(), // 当前时间戳
        to: "机器人",
        from: "用户",
      });

      // 清空输入框
      question.value = "";
    } catch (error) {
      ElMessage.error("发送提问失败");
    }

    //await fetchHistoryMessages();
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

watch(
    chatList.value,
    (newVal, oldVal) => {
      scrollToBottom();
    },
    { immediate: true }
);

const formatSendTime = (sendTime) => {
  console.log(sendTime)
  const now = new Date();
  const sendDate = new Date(sendTime);

  // 检查 sendDate 是否有效
  if (isNaN(sendDate)) {
    console.error("Invalid date:", sendTime);
    return "Invalid time";
  }
  console.log(now)
  console.log(sendDate)

  // 计算时间差（以毫秒为单位）
  const timeDiff = now - sendDate;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTargetDate = new Date(sendDate.getFullYear(), sendDate.getMonth(), sendDate.getDate());
  // 一天内的毫秒数
  const oneDay = 24 * 60 * 60 * 1000;

  // 发生在同一天
  if (startOfToday.getTime() === startOfTargetDate.getTime()) {
    return formatTime(sendDate);
  }

  // 如果发送时间在一天内
  if (timeDiff < oneDay) {
    return "昨天 " + formatTime(sendDate);
  }

  // 如果发送时间在二天至七天内
  if (timeDiff < 7 * oneDay) {
    const weekday = getWeekday(sendDate);
    return weekday + " " + formatTime(sendDate);
  }

  // 如果发送时间超过七天
  return (
      sendDate.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) + " " + formatTime(sendDate)
  );
};

const formatTime = (date) => {
  // 格式化时间为“时:分”
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return hours + ":" + minutes;
};

const getWeekday = (date) => {
  // 获取星期几的中文表示
  const weekdays = [
    "星期天",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return weekdays[date.getDay()];
};

// 页面加载时初始化历史消息
onMounted(() => {
  fetchHistoryMessages();
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
  background-color: #7de0bd;
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
  background-color: #8ce45f;
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

.avatar {
  background-color: #409eff;
  border: 2px solid #409eff;
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
</style>
