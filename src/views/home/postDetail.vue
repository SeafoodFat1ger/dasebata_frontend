<template>
  <TopHeader/>
  <div class="post-container">
    <div class="post-details">
      <!-- 帖子标题和作者信息 -->
      <div class="post-header">
        <img :src="postDetail.postAuthor.avatar" :alt="postDetail.postAuthor.name" class="avatar"/>
        <div class="post-title">
          <h2>{{ postDetail.postTitle }}</h2>
          <p class="username">{{ postDetail?.postAuthor?.name }}</p>
        </div>
      </div>

      <!-- 灰色分割线 -->
      <div class="divider"></div>

      <!-- 帖子内容 -->
      <div class="post-content">
        <div v-for="content in postDetail.postContents" :key="content.data">
          <div v-if="content.type === 'text'" v-html="content.data"></div>
          <img v-if="content.type === 'image'" :src="content.data" alt="帖子图片"/>
        </div>
        <p class="post-date">{{ postDetail?.postPublishDate }}</p>
      </div>

      <!-- 点赞、收藏、回复按钮 -->
      <div class="actions">
        <button @click="likePost" class="action-button" :class="{'liked': postDetail.isLiked}">
          <span class="icon">❤️</span> 点赞
        </button>
        <button @click="starPost" class="action-button" :class="{'bookmarked': postDetail.isBookmarked}">
          <span class="icon">⭐️</span> 收藏
        </button>
        <button @click="openReplyDialog" class="action-button">
          <span class="icon">✉️</span> 回复
        </button>
      </div>
      <!-- 评论区 -->
      <div class="comments">
        <div v-for="(comment, index) in comments" :key="comment.cmtId"
             :style="{ backgroundColor: getRandomColor(index) }"
        >
          <img :src="comment.cmtAuthor.avatar" alt="Avatar" class="comment-avatar"/>
          <div class="comment-content">
            <p class="comment-author">{{ comment.cmtAuthor.name }}</p>
            <p>{{ comment.cmtContent }}</p>
          </div>
        </div>
      </div>

      <!-- 回复对话框 -->
      <el-dialog title="回复" :visible.sync="showReplyDialog" width="30%">
        <el-input type="textarea" v-model="replyContent" placeholder="输入回复内容"></el-input>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeReplyDialog">取消</el-button>
          <el-button type="primary" @click="submitReply">提交</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import CommentBox from "@/components/CommentBox.vue";
import TopHeader from "@/views/TopHeader.vue";
import {Message} from "@element-plus/icons";
import {post, get} from '@/net';
import {ref} from "vue";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";
import 'element-plus/theme-chalk/el-icon.css';
import {Star} from "@element-plus/icons-vue";
import {useStore} from "@/stores/index.js"; // 引入图标样式

const store = useStore();

export default {
  computed: {
    Star() {
      return Star
    }
  },
  components: {
    Message, Star,
    TopHeader, CommentBox
  },
  setup() {
    const route = useRoute(); // 使用 useRoute 钩子获取路由信息

    const userId = store.auth.user.id;
    const postId = route.params.id; // 获取帖子 ID
    const postDetail = ref({
      "postId": 29,
      "postTitle": "",
      "postAuthor": {
        "avatar": "",
        "name": ""
      },
      "postPublishDate": "",
      "postTags": [
        ""
      ],
      "postCommentNum": 0,
      "postLikeNum": 1,
      "postBookmarkNum": 0,
      "isLiked": true,
      "isBookmarked": false,
      "postContents": [
        {
          "type": "text",
          "data": ""
        },
        {
          "type": "image",
          "data": ""
        }]
    });
    const colors = [
      '#fce4ec', // 颜色1
      '#e3f2fd', // 颜色2
      '#e8f5e9', // 颜色3
      '#fffde7', // 颜色4
      '#f3e5f5', // 颜色5
      '#f0f4c3', // 颜色6
      '#ffe0b2', // 颜色7
    ];
    const comments = [
      {
        cmtId: 2,
        cmtContent: "这是评论2的内容",
        cmtPublishDate: "2099-09-20 23:20",
        cmtAuthor: {
          avatar: "https://example.com/avatar2.png",
          name: "Bob",
        },
      }, {
        cmtId: 4,
        cmtContent: "这是评论2的内容",
        cmtPublishDate: "2099-09-20 23:20",
        cmtAuthor: {
          avatar: "https://example.com/avatar2.png",
          name: "Bob",
        },
      }
    ];

    const getRandomColor = (index) => {
      return colors[index % colors.length];
    };

    const fetchPostDetail = async (postId) => {
      get(`/posts/getID/${postId}/${userId}`, onSuccess);
    }

    const onSuccess = (message, data) => {
      postDetail.value = data;           // 存储帖子数据
      comments.value = data.comments; // 存储评论数据
    }

    fetchPostDetail(postId);

    const likePost = () => {
      const likeData = {
        postId: postId,
        userId: userId,
      };
      postDetail.value.isLiked = !postDetail.value.isLiked;
      if (postDetail.value.isLiked) {
        post(`/likes/add`, likeData, (message, data) => {
          ElMessage.success("点赞成功");
        });
      } else {
        post(`/likes/cancel`, likeData, (message, data) => {
          ElMessage.success("取消成功");
        });
      }
    };

    const starPost = () => {
      const likeData = {
        postId: postId,
        userId: userId,
      };
      // 切换收藏状态
      postDetail.value.isBookmarked = !postDetail.value.isBookmarked;
      if (postDetail.value.isBookmarked) {
        post(`/bookmarks/add`, likeData, (message, data) => {
          ElMessage.success("收藏成功");
        });
      } else {
        post(`/bookmarks/cancel`, likeData, (message, data) => {
          ElMessage.success("取消成功");
        });
      }
    };

    /****** 关于回复框 ********/
    let showReplyDialog = ref(false);
    let replyContent = ref("");

    const openReplyDialog = () => {
      showReplyDialog.value = true;
    };

    const closeReplyDialog = () => {
      showReplyDialog.value = false;
      replyContent.value = ""; // 清空输入框内容
    };

    const submitReply = () => {
      if (replyContent.value.trim() === "") {
        ElMessage.warning("回复内容不能为空");
        return;
      }
      // 执行回复逻辑，如发送请求
      console.log("回复内容:", replyContent.value);

      ElMessage.success("回复成功");
      closeReplyDialog();
    };

    return {
      postId, postDetail, comments,
      fetchPostDetail,
      likePost, starPost,
      showReplyDialog, replyContent, openReplyDialog, closeReplyDialog, submitReply,
      getRandomColor,
    }
  }
};
</script>

<style scoped>
.post-container {
  display: flex;
  justify-content: center; /* 居中对齐 */
  padding: 20px; /* 上下左右留白 */
}

.post-details {
  max-width: 800px; /* 设置最大宽度，避免内容过宽 */
  width: 100%;
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
}

.post-header {
  display: flex;
  align-items: center;
  background-color: #e0f7fa;
  padding: 16px;
  border-radius: 8px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 16px;
}

.post-title {
  flex: 1;
  font-size: 20px;
}

.username {
  font-size: 14px;
  color: #555;
}

.divider {
  height: 1px;
  background-color: #ccc;
  margin: 16px 0;
}

.post-content p {
  margin: 8px 0;
}

.post-date {
  text-align: right;
  font-size: 12px;
  color: #888;
  margin-top: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}


.liked {
  background-color: #ff6666; /* 点赞按钮被点赞时的深色背景 */
}


.bookmarked {
  background-color: #66ccff; /* 收藏按钮被收藏时的深色背景 */
}


.icon {
  margin-right: 6px;
}

.comments {
  margin-top: 20px;
}

.comment {
  display: flex;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.comment-even {
  background-color: #fce4ec;
}

.comment-1 {
  background-color: #e8f5e9;
}

.comment-1 {
  background-color: #e8f5e9;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content {
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-weight: bold;
}
</style>


