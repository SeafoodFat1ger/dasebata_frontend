<script>
import {ChatLineSquare, Star} from "@element-plus/icons-vue";

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
  },
  methods: {
    onMouseEnter(event) {
      event.currentTarget.style.backgroundColor = '#e5f0ff';
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
    <el-card shadow="hover"
             @mouseenter="onMouseEnter($event)" @mouseleave="onMouseLeave($event)"
             class="post-card">
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
.post-actions {
  bottom: 20px;  /* 距离底部20px */
  right: 5px;   /* 距离右边20px */
  gap: 0px;  /* 每个按钮之间有15px间隔 */
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 0;
  margin: 0;
}

.action-btn {
  background-color: #ebe2ff;
  border: none;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 0px;
  padding: 0px 6px;
  border-radius: 20px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.action-btn:hover {
  background-color: #f5f5f5;  /* 悬停时背景色变化 */
  color: #409EFF;  /* 悬停时文字颜色变化 */
}

.action-btn:active {
  background-color: #e4e7ed;  /* 点击时背景色变化 */
}

.action-btn span {
  font-size: 14px;
  color: #666;
}

.post-item {
  min-width: 300px;/*******************/
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
  transform: translateY(-5px);  /* 鼠标悬停时向上浮动 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);  /* 鼠标悬停时更明显的阴影 */
}

.post-item img {
  width: 100%;  /* 让图片宽度适应卡片 */
  height: 200px;  /* 设置固定高度 */
  object-fit: cover;  /* 保证图片裁剪不变形 */
}

.post-item .content {
  padding: 0px;  /* 内边距 */
}

.post-item .description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
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

.post-meta {
  color: #999;
  font-size: 8px;
  padding: 10px 20px 0px 0px;
}

.post-content {
  /* 分别设置 top, right, bottom, left 的 padding */
  padding: 10px 20px 10px 60px;
  font-size: 13px;
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

.post-card {
  border: none; /* 取消卡片的边框 */
  background-color: rgb(239, 244, 250);
}

.custom-tag {
  font-size: 7px;  /* 设置字体大小 */
  padding: 3px 5px;  /* 设置内边距 */
  border-radius: 7px;  /* 设置圆角 */
  background-color: #f4fdf4;  /* 背景颜色 */
  color: #4CAF50;  /* 文字颜色 */
  margin-left: 5px;
}
.custom-tag:hover {
  background-color: #e0f7fa;
  cursor: pointer;
}

</style>