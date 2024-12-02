<template>
  <div class="posts-container" @scroll="handleScroll">
    <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="false"/>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="finished" class="finished">没有更多数据了</div>
  </div>
</template>

<script>
import {get} from "@/net/index.js";
import PostItem from "@/components/PostItem.vue";


export default {

  components: {PostItem},
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      posts: [], // 存储所有加载的帖子数据
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页加载的记录数
      total: 0, // 记录总数
      loading: false, // 是否正在加载
      finished: false // 是否加载完成
    };
  },
  methods: {
    async fetchPosts() {
      if (this.loading || this.finished) return; // 如果正在加载或已经加载完毕，则不再触发请求

      this.loading = true;

      // 假设后台接口类似 `/posts/user/{userId}/{pageNumber}/{pageSize}`
      get(`/bookmarks/user/${this.userId}/${this.currentPage}/${this.pageSize}`, (message, data) => {
        this.posts.push(...data.records); // 将新数据追加到现有数组
        this.total = data.total;

        // 判断是否已经加载完所有数据
        if (this.posts.length >= this.total) {
          this.finished = true;
        } else {
          this.currentPage += 1; // 更新页码
        }

        this.loading = false;
      });
    },
    handleScroll() {
      const container = this.$el; // 获取当前元素
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        this.fetchPosts(); // 滚动到底部时触发加载更多数据
      }
    }
  },
  mounted() {
    this.fetchPosts(); // 初始化加载第一页数据
  }
};
</script>

<style scoped>
.posts-container {
  overflow-y: auto;
  max-height: 80vh;
}

.post-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.post-content {
  padding: 16px;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
}

.post-summary {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
}

.post-author {
  font-size: 12px;
  color: #999;
}

.post-stats {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.loading,
.finished {
  text-align: center;
  font-size: 16px;
  color: #999;
  padding: 20px;
}
</style>
