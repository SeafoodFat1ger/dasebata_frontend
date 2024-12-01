<template>
  <div class="search-page">
    <!-- 返回按钮 -->
    <div class="search-header">
      <button @click="goBack" class="back-button">
        ← 返回
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
          <div v-else class="result-section">
            <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="true"/>
          </div>
        </div>

        <!-- 帖子部分 -->
        <div class="results-column">
          <h2>帖子</h2>
          <div class="result-section" v-if="posts.length === 0 && !loading">
            <p>没有找到相关帖子</p>
          </div>
          <div v-else class="result-section">
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
  font-size: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.back-button:hover {
  text-decoration: underline;
}

.results-columns {
  display: flex;
  justify-content: space-between;
}

.results-column {
  width: 32%;
  padding: 10px;
}

.result-item {
  margin-bottom: 20px;
}

.result-card {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  padding: 10px;
}

.card-content {
  display: flex;
  align-items: center;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}


.username {
  font-size: 18px;
  font-weight: bold;
}
</style>
