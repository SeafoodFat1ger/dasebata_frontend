<template>

  <div class="scrolling-banner">
    <div class="scrolling-content">
      <a v-for="(item, index) in announcements" :key="index" :href="item.link" target="_blank">
        <i class="icon">🔊</i> <!-- 声音图标 -->
        {{ item.text }}
      </a>
    </div>
  </div>

  <div class="Home">
    <!-- 标签滚动区域 (保留不变) -->
    <div style="display: flex; align-items: center;">
      <div @click="scrollLeft('scrollContainer1')" class="scroll_btn">
        <el-icon>
          <ArrowLeft/>
        </el-icon>
      </div>
      <div
          ref="scrollContainer1"
          style="height: 60%; width: 100%; display: flex; justify-content: space-between; overflow-x: auto;"
      >
        <div v-for="tag in tags" :key="tag.id" class="card">
          <img :src="tag.url" :alt="tag.tag" class="card-image"/>
          <div class="card-content" @click="navigateToTag(tag.tag)">
            <h3 class="card-title">{{ tag.tag }}</h3>
            <p class="card-followers">{{ tag.tagPersonNum }} 人关注</p>
          </div>
        </div>
      </div>
      <div @click="scrollRight('scrollContainer1')" class="scroll_btn">
        <el-icon>
          <ArrowRight/>
        </el-icon>
      </div>
    </div>

    <!-- 帖子热榜 -->
    <div class="recent-questions-container">
      <div class="recent-questions">
        <div class="recent-header">
          <h3 class="recent-title">帖子热榜</h3>
          <button class="arrow-link" @click="navigateToAllPost">
            ➜
          </button>
        </div>
        <div class="questions-list">
          <div
              v-for="(post, index) in hotPosts"
              :key="post.postId"
              class="question-item"
              @click="navigateToPost(post.postId)"
          >
            <div class="rank-circle" :style="getRankCircleStyle(index)">
              {{ index + 1 }}
            </div>
            <div style="flex-grow: 1">
              {{ post.postTitle }}
            </div>
          </div>
        </div>
      </div>

      <!-- 问题热榜 -->
      <div class="recent-questions">
        <div class="recent-header">
          <h3 class="recent-title">问题热榜</h3>
          <button class="arrow-link" @click="navigateToAllProblem">
            ➜
          </button>
        </div>
        <div class="questions-list">
          <div
              v-for="(question, index) in hotQuestions"
              :key="question.postId"
              class="question-item"
              @click="navigateToQuestion(question.postId)"
          >
            <div class="rank-circle" :style="getRankCircleStyle(index)">
              {{ index + 1 }}
            </div>
            <div style="flex-grow: 1">
              {{ question.postTitle }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {get} from "@/net/index.js";
import {ArrowLeft, ArrowRight} from "@element-plus/icons-vue";
import {useStore} from "@/stores/index.js";

const store = useStore();
const userId = store.auth.user.id;

export default {
  components: {
    ArrowLeft,
    ArrowRight,
  },
  data() {
    return {
      announcements: [
        {text: '欢迎访问我们的网站！'},
        {text: '[置顶] 进站须知~~~~', link: '/home/postDetail/92'},
        //{ text: '[置顶] 数据库作业介绍~~~~~', link: '/home/postDetail/10000' },
        {text: '[置顶] 数据库成员介绍~~~~~~', link: '/home/postDetail/93'}
      ],

      tags: [{
        "id": 1,
        "tag": "使用交流",
        "image": "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png",
        "tagPersonNum": 109
      }],
      hotPosts: [], // 最近更新提问数据
      hotQuestions: [], // 最近热门提问数据
    };
  },

  methods: {
    async fetchQuestions() {
      get(`/posts/get/hot/post/all`, (message, data) => {
        this.hotPosts = data.records.slice(0, 10);
      });

      get(`/posts/get/hot/problem/all`, (message, data) => {
        this.hotQuestions = data.records;
      });

    },

    async fetchTopics() {
      get(`/posts/getAllTags/hot/${userId}`, (message, data) => {
        this.tags = data.records;
      });
    },

    navigateToQuestion(str) {
      this.$router.push(`/home/postDetail/${str}`);
    },
    navigateToPost(str) {
      this.$router.push(`/home/postDetail/${str}`);
    },

    scrollLeft(row1) {
      this.$refs[row1].scrollBy({
        left: -600, // 每次点击滚动的距离
        behavior: 'smooth',
      });
    },
    scrollRight(row1) {
      this.$refs[row1].scrollBy({
        left: 600, // 每次点击滚动的距离
        behavior: 'smooth',
      });
    },
    navigateToTag(tagName) {
      this.$router.push(`/home/tagDetail/${tagName}`);
    },

    navigateToAllPost() {
      this.$router.push(`/home/posts`);
    },

    navigateToAllProblem() {
      this.$router.push(`/home/problems`);
    },

    getRankCircleStyle(index) {
      // 根据排序的索引返回不同的背景颜色
      if (index === 0) return {backgroundColor: 'rgba(255,119,120,0.82)'}; // 第一名：红色
      if (index === 1) return {backgroundColor: 'rgba(255,136,0,0.69)'}; // 第二名：橙色
      if (index === 2) return {backgroundColor: 'rgba(255,213,0,0.82)'}; // 第三名：黄色
      if (index === 3) return {backgroundColor: 'rgba(144,238,144,0.82)'}; // 第四名：淡绿
      if (index === 4) return {backgroundColor: 'rgba(140,255,255,0.82)'}; // 第五名：青色
      if (index === 5) return {backgroundColor: 'rgba(135,206,235,0.82)'}; // 第六名：淡蓝色
      if (index === 6) return {backgroundColor: 'rgba(238,130,238,0.82)'}; // 第七名：紫色
      if (index === 7) return {backgroundColor: 'rgba(255,182,193,0.82)'}; // 第八名：淡粉色
      if (index === 8) return {backgroundColor: 'rgba(255,105,180,0.82)'}; // 第九名：热粉色
      if (index === 9) return {backgroundColor: 'rgba(255,20,147,0.82)'}; // 第十名：深粉色
    },
  },
  mounted() {
    this.fetchTopics();
    this.fetchQuestions();
  }
};
</script>

<style scoped>

/* 公告栏整体容器 */
.scrolling-banner {
  margin-top: 60px;
  width: 100%;
  height: 50px;
  overflow: hidden;
  background-color: #fdf7e4;
  border: 1px solid #e6dfc8;

}

/* 滚动内容容器 */
.scrolling-content {
  display: flex;
  flex-direction: column;
  animation: scrollBanner 12s linear infinite; /* 动画：无缝垂直滚动 */
}

.scrolling-items {
  display: flex;
  flex-direction: column;
}

/* 每条公告样式 */
.scrolling-content a {
  align-items: center;
  padding: 0 10px;
  height: 50px;
  color: #d9773f;
  font-size: 16px;
  text-decoration: none;
  white-space: nowrap;
  margin: 0;
  display: block;
  width: 100%;
  text-align: center;
}

.scrolling-content a:hover {
  text-decoration: underline; /* 鼠标悬停时添加下划线 */
}

/* 图标样式 */
.icon {
  margin-right: 10px;
}

/* 动画：实现无缝垂直滚动 */
@keyframes scrollBanner {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%);
  }
}

::-webkit-scrollbar {
  display: none;
}

.Home {
  overflow-y: auto;
  padding: 20px;
}

.scroll_btn {
  width: 30px;
  height: 30px;
  text-align: center;
  font-size: 20px;
  border: none;
  border-radius: 50%;
  background-color: #d7e7fd;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, color 0.3s;
}

.scroll_btn:hover {
  background-color: rgba(49, 162, 232, 0.1);
  color: #409eff;
}

.card {
  padding-top: 10px;
  width: 190px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: box-shadow 0.3s, transform 0.3s;
  margin-bottom: 10px;
  height: 240px;
  display: inline-block;
  margin-right: 5px;
  flex-shrink: 0;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(5px);
}

.card-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 2px solid #eee;
}

.card-content {
  padding: 0px;
  position: relative;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding-left: 10px;
  padding-bottom: 0px;
}

.card-followers {
  font-size: 10px;
  color: #888;
  padding-left: 10px;
  padding-bottom: 30px;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, color 0.3s;
}

.favorite-btn:hover {
  background-color: rgba(49, 162, 232, 0.1);
  color: #409eff;
}

.recent-questions-container {
  display: flex;
  justify-content: space-between;
  gap: 20px; /* 间距 */
}

.recent-questions {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  width: 48%; /* 每个区域宽度为 48% */
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.recent-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.arrow-link {
  background: #ffffff;
  border: none;
  color: #409eff;
  font-weight: bold;
  text-decoration: none;
  font-size: 30px;
  cursor: pointer; /* 增加手型光标 */
}


.questions-list {
  display: flex;
  flex-direction: column;
}

.question-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.question-item:hover {
  background-color: #f1f1f1;
  transform: translateX(5px);
}

.question-item:last-child {
  border-bottom: none;
}

.question-item:hover {
  background-color: rgba(49, 162, 232, 0.1);
  color: #409eff;
}

.rank-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 15px;
  transition: transform 0.3s ease;
}

.question-item:hover .rank-circle {
  transform: scale(1.1);
}

</style>
