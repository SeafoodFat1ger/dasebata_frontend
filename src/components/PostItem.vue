<script>
import {ChatLineSquare, Star} from "@element-plus/icons-vue";

export default {
  components: {
    ChatLineSquare,
    Star
  },
  name: "PostItem",
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  methods: {
    onMouseEnter(event) {
      event.currentTarget.style.backgroundColor = '#f5f5f5';
    },
    onMouseLeave(event) {
      event.currentTarget.style.backgroundColor = '';
    },
    goToPost(id) {
      this.$router.push(`/home/postDetail/${id}`); // 路由跳转
    }
  }
}
</script>

<template>
  <div class="post-item" @click="goToPost(post.postId)">
    <el-card shadow="hover" :body-style="{ padding: '20px', border: 'none' }"
             @mouseenter="onMouseEnter($event)" @mouseleave="onMouseLeave($event)" class="post-card">
      <div class="post-header">
        <el-avatar :src="post.postAuthor.avatar"></el-avatar>
        <div class="post-info">
          <div class="post-title">{{ post.postTitle }}</div>
          <div class="post-meta">楼主 发布于 {{ post.postPublishDate }}</div>
        </div>
      </div>
      <div class="post-content">
        {{ post.postSummary }}
      </div>
      <div class="post-footer">
        <el-tag v-for="tag in post.postTags" :key="tag" type="success">{{ tag }}</el-tag>
        <el-icon>
          <ChatLineSquare/>
        </el-icon>
        <span>{{ post.postCommentNum }}</span>
        <el-icon>
          <Star/>
        </el-icon>
        <span>{{ post.postBookmarkNum }}</span>
        <span class="fontFamily hhtxheart"></span>
        <span>{{ post.postLikeNum }}</span>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.post-item {
  padding: 0px 0;
  transition: background-color 0.3s;
}

.post-header {
  display: flex;
  align-items: center;
}

.post-info {
  margin-left: 10px;
}

.post-title {
  font-weight: bold;
}

.post-meta {
  color: #999;
}

.post-content {
  margin-top: 10px;
  color: #333;
}

.post-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.post-footer .el-icon {
  margin-right: 5px;
}
</style>