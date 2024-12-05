<template>
  <div class="search-page">
    <!-- 返回按钮 -->
    <div class="search-header">
      <button @click="goBack" class="back-button">
        < 返回
      </button>
    </div>

    <h1>"{{ searchQuery }}"的搜索结果如下:</h1>

    <!-- 搜索结果 -->
    <div v-if="loading" class="loading">
      正在加载搜索结果...
    </div>

    <div v-else class="results-container">
      <div class="results-columns">
        <!-- 问题部分 -->
        <div class="results-column">
          <h2>问题</h2>
          <div class="result-section" v-if="problems.length === 0 && !loading">
            <p>没有找到相关问题</p>
          </div>
          <div v-else class="post-items-container">
            <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="true"/>
          </div>
        </div>

        <!-- 帖子部分 -->
        <div class="results-column">
          <h2>帖子</h2>
          <div class="result-section" v-if="posts.length === 0 && !loading">
            <p>没有找到相关帖子</p>
          </div>
          <div v-else class="post-items-container">
            <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="false"/>
          </div>
        </div>

        <!-- 用户部分 -->
        <div class="results-column">
          <h2>用户</h2>
          <div class="result-section" v-if="users.length === 0 && !loading">
            <p>没有找到相关用户</p>
          </div>
          <div v-else class="result-section">
            <div v-for="item in users" :key="item.id" class="result-item">
              <el-card :body-style="{ padding: '20px' }" class="result-card" @click="goToDetail(item.id)">
                <div class="card-content">
                  <el-avatar :src="item.avatar" class="avatar"/>
                  <h3 class="username">{{ item.username }}</h3>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElButton, ElCard } from 'element-plus';
import { get } from '@/net/index.js';
import PostItem from "@/components/PostItem.vue";

const route = useRoute();
const router = useRouter();

// 搜索参数
const searchQuery = ref(route.query.query || '');

// 搜索结果
const posts = ref([]);
const problems = ref([]);
const users = ref([]);

// 加载状态
const loading = ref(false);

// 获取搜索结果
const fetchSearchResults = async () => {
  if (!searchQuery.value) return;

  loading.value = true;
  get(`/posts/find/post/${searchQuery.value}`, (message, data) => {
    posts.value = data.records;
  });

  get(`/posts/find/problem/${searchQuery.value}`, (message, data) => {
    problems.value = data.records;
  });

  get(`/posts/find/user/${searchQuery.value}`, (message, data) => {
    users.value = data.records;
  });

  loading.value = false;
};

// 跳转到详情页面
const goToDetail = (id) => {
  router.push(`/home/profile/${id}`)
};

// 返回上一页
const goBack = () => {
  window.history.back()
};

// 监听路由变化，重新加载搜索结果
watch(() => route.query.query, (newQuery) => {
  searchQuery.value = newQuery;
  posts.value = [];
  problems.value = [];
  users.value = [];
  fetchSearchResults();
});

// 页面初始化时加载搜索结果
onMounted(() => {
  fetchSearchResults();
});
</script>

<style scoped>
.search-page {
  padding-top: 60px;
}

.search-header {
  margin-bottom: 20px;
}

.back-button {
  background-color: transparent;
  border: none;
  color: #409EFF;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.back-button:hover {
  text-decoration: underline;
}

.results-container {
  padding: 20px;
  background-color: #FFFAF5FF;
}

.results-columns {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  flex-wrap: wrap; /* 支持响应式布局 */
  max-width: 100%; /* 保证不会超出父容器 */
}

.results-column {
  flex: 1;
  min-width: 280px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px 20px 30px 15px;
  margin: 5px;
  transition: transform 0.3s ease;
  gap: 10px;
}

.results-column:hover {
  transform: translateY(-1px);
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid rgba(54, 20, 0, 0.22);
  padding-bottom: 5px;
}

.result-section {
  margin-top: 20px;
}

.post-items-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  flex-wrap: wrap; /* 支持换行 */
  gap: 3px; /* 子元素之间的间距 */
  padding: 5px;
  max-width: 100%; /* 保证不会超出父容器 */
  box-sizing: border-box;
}

.result-item {
  margin-bottom: 10px; /* 给每个卡片之间添加间距 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-card {
  border-radius: 12px; /* 卡片圆角 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* 卡片阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 700px; /* 最大宽度，防止卡片过大 */
  margin: 0 auto; /* 使卡片居中 */
  background: linear-gradient(135deg, rgba(194, 214, 246, 0.44), rgba(236, 255, 213, 0.51)); /* 渐变背景 */
}


.result-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .results-columns {
    flex-direction: column;
  }

  .results-column {
    flex: none;
    width: 100%;
  }
}
</style>
