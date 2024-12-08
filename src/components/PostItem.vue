<script>
import { ChatLineSquare, Star } from "@element-plus/icons-vue";

export default {
  components: {
    ChatLineSquare,
    Star,
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
    color: {
      type: String,
      default: '#edf2f8' // 默认颜色，如果没有传入颜色值
    }
  },
  data() {
    return {
      isHovered: false // 用来标记是否悬停
    };
  },
  methods: {
    goToPost(id) {
      this.$router.push(`/home/postDetail/${id}`);
    },
    navigateToPage(tag) {
      this.$router.push(`/home/tagDetail/${tag}`);
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      return date.toLocaleString('zh-CN', options);
    },
    goToUserProfile(userId) {
      this.$router.push(`/home/profile/${userId}`);
    }
  }
}
</script>

<template>
  <div class="post-item" @click="goToPost(post.postId)">
    <el-card shadow="hover"
             :style="{ backgroundColor: isHovered ? '#e5f0ff' : color }"
             @mouseenter="isHovered = true"
             @mouseleave="isHovered = false">
      <div class="post-header">
        <el-avatar :src="post.postAuthor.avatar"
                   @click.stop="goToUserProfile(post.postAuthor.id)"></el-avatar>
        <div class="post-info">
          <div class="post-title">{{ post.postTitle }}</div>
          <el-tag v-if="needTag"
                  class="custom-tag"
                  @click.stop="navigateToPage(tag)"
                  v-for="tag in post.postTags" :key="tag" type="success">{{ tag }}
          </el-tag>
        </div>
      </div>
      <div class="post-content">
        {{ post.postSummary }}
      </div>
      <div class="post-footer">
        <div class="post-meta">{{ post.postAuthor.name }} 发布于 {{ formatTime(post.postPublishDate) }}</div>
      </div>
      <div class="post-actions">
        <div class="action-item">
          <el-button class="action-btn" @click="likePost" size="small">
            <span>❤️</span>
            <span>{{ post.postLikeNum }}</span>
          </el-button>
          <el-button class="action-btn" @click="favoritePost" size="small">
            <span role="img" aria-label="star">⭐</span>
            <span>{{ post.postBookmarkNum }}</span>
          </el-button>
          <el-button class="action-btn" @click="commentPost" size="small">
            <span role="img" aria-label="comment">💬</span>
            <span>{{ post.postCommentNum }}</span>
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 基本布局优化 */
.post-item {
  min-width: 350px;/*******************/
  width: 500px;
  flex: 1 1 300px;  /* 让每个 PostItem 的宽度为 300px，且允许根据容器大小变化 */
  max-height: 300px;  /* 设置最大高度 */
  margin: 5px;  /* 设置间距 */
  background-color: rgb(243, 245, 252);
  border-radius: 20px;  /* 圆角边框 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);  /* 卡片的阴影效果 */
  overflow: hidden;  /* 防止内容溢出 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;  /* 添加动画效果 */
  cursor: pointer;  /* 鼠标悬停时显示为可点击 */
  max-width: 80%;
}

.post-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 卡片的内容样式 */
.post-card {
  border: none;
  background-color: rgb(239, 244, 250);
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
  font-size: 18px;
  padding: 8px 10px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  padding: 10px 20px;
}

.post-content {
  padding: 10px 20px 10px 60px;
  font-size: 13px;
  color: #333;
}

.custom-tag {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  background-color: #f4fdf4;
  color: #4CAF50;
  margin-left: 5px;
}

.custom-tag:hover {
  background-color: #e0f7fa;
  cursor: pointer;
}

/* 动作按钮样式优化 */
.post-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px 15px;
}

.action-item {
  display: flex;
  align-items: center;
}

.action-btn {
  background-color: #ebe2ff;
  border: none;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #409EFF;
}

.action-btn:active {
  background-color: #e4e7ed;
}

.action-btn span {
  font-size: 14px;
  color: #666;
}
</style>
