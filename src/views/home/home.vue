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
          <div class="card-content">
            <h3 class="card-title">{{ tag.tag }}</h3>
            <p class="card-followers">{{ tag.tagPersonNum }} 人关注</p>
            <button class="favorite-btn" @click="navigateToTag(tag.tag)">
              <el-icon>
                <ArrowRight/>
              </el-icon>
            </button>
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
        { text: '欢迎访问我们的网站！'},
        { text: '[置顶] 进站须知~~~~', link: '/home/postDetail/1' },
        { text: '[置顶] 数据库作业介绍~~~~~', link: '/home/postDetail/1' },
        { text: '[置顶] 数据库成员介绍~~~~~~', link: '/home/postDetail/1' }
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
      // 模拟获取最新提问数据

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

    navigateToQuestion(str){
      this.$router.push(`/home/postDetail/${str}`);
    },
    navigateToPost(str){
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
      if (index === 0) return { backgroundColor: 'red' };    // 第一名：红色
      if (index === 1) return { backgroundColor: 'orange' }; // 第二名：橙色
      if (index === 2) return { backgroundColor: 'yellow' }; // 第三名：黄色
      return { backgroundColor: 'gray' };                    // 后续名次：灰色
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
  height: 50px; /* 控制公告栏高度 */
  overflow: hidden;
  background-color: #fdf7e4; /* 浅黄色背景 */
  border: 1px solid #e6dfc8; /* 边框颜色与背景协调 */

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
  align-items: center; /* 图标与文字垂直居中 */
  padding: 0 10px;
  height: 50px; /* 每条公告的高度与容器一致 */
  color: #d9773f; /* 橙色文字 */
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
  margin-right: 10px; /* 图标与文字的间距 */
}

/* 动画：实现无缝垂直滚动 */
@keyframes scrollBanner {
  0% {
    transform: translateY(0); /* 起始位置 */
  }
  100% {
    transform: translateY(-100%); /* 滚动完整个高度 */
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
  width: 50px;
  text-align: center;
  font-size: 30px;
  height: 50px;
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

.scroll_btn:hover {
  background-color: rgba(49, 162, 232, 0.1);
  color: #409eff;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: box-shadow 0.3s;
  margin-bottom: 10px;
  width: 300px;
  height: 100%;
  display: inline-block;
  margin-right: 5px;
  flex-shrink: 0;
}

.card:hover {
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-content {
  padding: 16px;
  position: relative;
}

.card-title {
  font-size: 18px;
  margin: 0 0 8px;
}

.card-followers {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
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

  font-size: 16px;
  color: #666;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
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
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  margin-right: 12px;
}
</style>
