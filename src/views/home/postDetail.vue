<template>
  <el-container>
    <el-header>
      <TopHeader />
    </el-header>
    <el-main>
      <el-card class="post-card">
        <!-- Header 部分：显示作者头像和帖子标题 -->
        <template #header>
          <el-container class="post-header">
            <el-aside width="80px">
              <!-- 左侧头像和作者名 -->
              <div class="author-info">
                <img :src="post.postAuthor.avatar" alt="用户头像" class="avatar" />
                <div class="author-name">{{ post.postAuthor.name }}</div>
              </div>
            </el-aside>
            <el-main>
              <!-- 右侧帖子标题 -->
              <div class="post-title">
                <h2>{{ post.postTitle }}</h2>
              </div>
            </el-main>
          </el-container>
        </template>

        <!-- 帖子内容部分 -->
        <div class="post-content">
          <div v-for="content in post.postContent" :key="content.data">
            <p v-if="content.type === 'text'">{{ content.data }}</p>
            <img v-if="content.type === 'image'" :src="content.data" alt="帖子图片" />
          </div>
        </div>

        <template #footer>
          <el-container style="display: flex; align-items: center; justify-content: space-between;">
            <el-aside width="80%">
              <!-- 左侧发布日期 -->
              <div>{{ post.postPublishDate }}</div>
            </el-aside>
            <el-main>
              <!-- 右侧信封图标和回复数量 -->
              <div style="display: flex; align-items: center;">
                <el-icon><message /></el-icon>
                <span style="margin-left: 5px;"> {{ cmts.length }}</span>
              </div>
            </el-main>
          </el-container>
        </template>
      </el-card>
    </el-main>
  </el-container>
  <!-- 评论区域 -->
  <el-container class="comments-container">
    <div v-for="comment in cmts" :key="comment.id" class="comment-box">
      <el-card>
        <el-aside width="20%">
          <!-- 评论者信息 -->
          <div class="comment-author">
            <img :src="comment.cmtAuthor.avatar" alt="评论者头像" class="avatar" />
            <span class="author-name">{{ comment.cmtAuthor.name }}</span>
            <span class="comment-date">{{ comment.cmtPublishDate }}</span>
          </div>
        </el-aside>
        <!-- 评论内容 -->
        <el-main>
          <div class="comment-content">
            {{ comment.cmtContent }}
          </div>
        </el-main>
      </el-card>
    </div>
  </el-container>
</template>

<script>

import CommentBox from "@/components/CommentBox.vue";
import TopHeader from "@/views/TopHeader.vue";
import {Message} from "@element-plus/icons";

export default {
  components: {Message, TopHeader, CommentBox},
  data() {
    return {
      post: // 模拟存储帖子详情数据,实际从后端读取
      {
        postId: 5,
        postTitle: "这是帖子标题",
        postAuthor: {
            avatar: "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png",
            name: "小黑",
        },
        postPublishDate: "2099-09-20 22:54",
        postTags: ["tag1", "tag2"],
        postContent:[
          {
            type: "text",
            data: "这是帖子的第一段文字内容。",
          },
          {
            type: "image",
            data: "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png",
          },
        ]
      },
      cmts: [
        {
          cmtId: 1,
          cmtContent: "这是评论1的内容",
          cmtPublishDate: "2099-09-20 23:13",
          cmtAuthor: {
            avatar: "https://example.com/avatar1.png",
            name: "Alice",
          },
        },
        // {
        //   cmtId: 2,
        //   cmtContent: "这是评论2的内容",
        //   cmtPublishDate: "2099-09-20 23:20",
        //   cmtAuthor: {
        //     avatar: "https://example.com/avatar2.png",
        //     name: "Bob",
        //   },
        // },
      ],
    };
  },
  created() {
    const postId = this.$route.params.id; // // 从路由参数中获取帖子 ID
    //this.fetchPostDetails(postId); // 调用获取帖子详情
  },
  methods: {
    async fetchPostDetails(id) {
      try { // 从后台 API 获取帖子数据
        const response = await axios.get(`/api/posts/${id}`);
        this.post = response.data;
      } catch (error) {
        console.error("获取帖子详情失败：", error); // 处理错误，如显示错误信息
      }
    },
  },
};
</script>


<style scoped>
.post-header {
  padding: 0; /* 删除不必要的 padding */
  height: auto; /* 设置高度为自动调整 */
}

.post-card {
  width: 90%; /* 设置卡片宽度为父容器的 60% */
  max-width: 1000px; /* 设置最大宽度，防止卡片在大屏幕上过宽 */
  //margin: 20px auto; /* 设置垂直和水平居中 */
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); /* 添加卡片阴影 */
  border-radius: 14px; /* 设置圆角，值越大圆角越明显 */
}

.author-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.author-name {
  font-size: 8px;
}

.post-title {
  display: flex;
  //justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  padding-left: 0px; /* 适当缩小标题与头像的间距 */
}

.comments-container {
  margin-top: 40px;
}

.comment-box {
  width: 90%; /* 设置卡片宽度为父容器的 60% */
  margin-bottom: 20px;
}

.comment-author {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.comment-author .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-author .author-name {
  font-weight: bold;
  margin-right: 10px;
}

.comment-date {
  color: gray;
}

.comment-content {
  margin-top: 10px;
}
</style>