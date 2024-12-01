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
    },
    needTag: {
      type: Boolean,
      required: true
    },
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
    },
    navigateToPage(tag) {
      this.$router.push(`/home/tagDetail/${tag}`); // 路由跳转
    },
     formatTime(dateString){
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      return date.toLocaleString('zh-CN', options); // 根据需求调整格式
    },
    //TODO
    goToUserProfile(userId) {
      // 路由跳转到用户的个人资料页
      this.$router.push(`/home/profile/${userId}`);
    },

  }
}
</script>

<template>
  <div class="post-item" @click="goToPost(post.postId)">
    <el-card shadow="hover" :body-style="{ padding: '20px', border: 'none' }"
             @mouseenter="onMouseEnter($event)" @mouseleave="onMouseLeave($event)" class="post-card">
      <div class="post-header">
        <el-avatar :src="post.postAuthor.avatar"
                   @click.stop="goToUserProfile(post.postAuthor.id)"></el-avatar>
        <div class="post-info">
          <div class="post-title">{{ post.postTitle }}</div>
          <div class="post-meta">{{ post.postAuthor.name }} 发布于 {{ formatTime(post.postPublishDate) }}</div>
        </div>
      </div>
      <div class="post-content">
        {{ post.postSummary }}
      </div>
      <div class="post-footer">
        <el-tag v-if="needTag"
                @click.stop="navigateToPage(tag)"
                v-for="tag in post.postTags" :key="tag" type="success">{{ tag }}
        </el-tag>
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