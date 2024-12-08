<template>
  <TopHeader/>
  <div class="post-container">
    <div class="post-details">
      <!-- 帖子标题和作者信息 -->
      <div class="post-header">
        <img @click="navigateTo(postAuthorId)"
             :src="postDetail.postAuthor.avatar"
             :alt="postDetail.postAuthor.name"
             class="avatar" />
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
          <img v-if="content.type === 'image' && content.data !== 'null'" :src="content.data" alt="帖子图片" />
        </div>
        <p class="post-date">{{ postDetail?.postPublishDate }}</p>
      </div>

      <!-- 点赞、收藏、评论按钮 -->
      <div class="actions">
        <button @click="likePost" class="action-button" :class="{'liked': postDetail.isLiked}">
          <span class="icon">❤️</span>点赞
        </button>
        <button @click="starPost" class="action-button" :class="{'bookmarked': postDetail.isBookmarked}">
          <span class="icon">⭐️</span>收藏
        </button>
        <button @click="openReplyDialog" class="action-button">
          <span class="icon">✉️</span>评论
        </button>
        <button v-if="userId === 3 ||userId === postAuthorId" @click="deletePost" class="action-button delete">
          <span class="icon">❌</span>删帖
        </button>
      </div>

      <!-- 评论对话框 -->
      <div v-if="showReplyDialog" class="reply-dialog">
        <div class="dialog-content">
          <myEditor @update:content="updateContent"/>
          <div class="dialog-actions">
            <button @click="closeReplyDialog" class="cancel-btn">取消</button>
            <button @click="submitReply()" class="submit-btn">提交</button>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments">
        <div v-for="(comment, index) in comments" :key="comment.cmtId" class="comment-card"
             @click="replyByClick(comment.cmtAuthor.name)"
             :style="{ backgroundColor: getRandomColor(userId) }">
          <div>
            <img :src="comment.cmtAuthor.avatar" alt="Avatar" class="comment-avatar"
                  @click="navigateTo(comment.cmtAuthor.id)"/>
            <p class="comment-author">{{ comment.cmtAuthor.name }}</p>
          </div>

          <div class="comment-content" style="flex-direction: column">
            <div v-html="comment.cmtContent"></div>
            <div class="comment-date">{{ comment.cmtPublishDate }}</div>
          </div>

          <!-- 删除按钮 -->
          <button v-if="userId === 3 || comment.cmtAuthor.id === userId"
                  @click="deleteCmt(comment.cmtId, comment.cmtContent, comment.cmtAuthor)" class="delete-comment-btn">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopHeader from "@/views/TopHeader.vue";
import {Message} from "@element-plus/icons";
import {post, get} from '@/net';
import {ref} from "vue";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";
import 'element-plus/theme-chalk/el-icon.css';
import {Star} from "@element-plus/icons-vue";
import {useStore} from "@/stores/index.js";
import router from "@/router/index.js";
import user from "@element-plus/icons/lib/User.js";// 引入图标样式
import myEditor from "@/components/Editor.vue";

const store = useStore();

export default {
  computed: {
    user() {
      return user
    },
    Star() {
      return Star
    }
  },
  components: {
    myEditor,
    Message, Star,
    TopHeader,
  },
  setup() {
    const route = useRoute(); // 使用 useRoute 钩子获取路由信息

    const userId = store.auth.user.id;
    const postId = route.params.id; // 获取帖子 ID
    const postDetail = ref({});
    const colors = [
      'rgba(252,228,236,0.42)', // 颜色1
      'rgba(227,242,253,0.53)', // 颜色2
      'rgba(232,245,233,0.34)', // 颜色3
      'rgba(255,253,231,0.33)', // 颜色4
      'rgba(243,229,245,0.23)', // 颜色5
      'rgba(240,244,195,0.2)', // 颜色6
      'rgba(255,224,178,0.26)', // 颜色7
    ];

    const getRandomColor = (index) => {
      return colors[index % colors.length];
    };

    const updateContent = async (newContent) => {
      replyContent.value = newContent; // 更新父组件的内容
    };

    const comments = ref([]);
    const postAuthorId = ref();
    const fetchPostDetail = async (postId) => {
      get(`/posts/getID/${postId}/${userId}`,
          (message, data) => {
            postDetail.value = data;           // 存储帖子数据
            comments.value = data.comments; // 存储评论数据
            // 格式化日期
            comments.value.forEach(comment => {
              comment.cmtPublishDate = comment.cmtPublishDate.slice(0, 10) +
                  ' ' + comment.cmtPublishDate.slice(11);
            });
            postDetail.value.postPublishDate=postDetail.value.postPublishDate.slice(0, 10)+
                ' '+postDetail.value.postPublishDate.slice(11);

            postAuthorId.value = data.postAuthor.id;

            console.log(postDetail.value);
          });
      // console.log(comments.value);
    }
    fetchPostDetail(postId);

    /** 删评论 ***/
    const deleteCmt = (cmtId, content, cmtAuthor) => {
      if (userId === 3 && cmtAuthor.name !== "root") {
        const confirmDelete = confirm("尊敬的管理员您好，确定要删除这个评论吗?\n删除后将通知该用户");
        if (confirmDelete) {
          const data = {
            postId: postId,
            cmtId: cmtId,
          };
          sendMsg("from管理员的信息: 【" +
              cmtAuthor.name + "】同学你好，你在帖子标题为 \"" + postDetail.value.postTitle +
              "\"中的评论" + "\"" + content + "\"" +
              "已被管理员删除！", cmtAuthor.id);
          // 调用后端删除接口
          post(`/posts/deleteCmt/${cmtId}`, data, (message, data) => {
            ElMessage.success("评论删除成功！已通知该用户~");
            // 删除本地的评论数据
            comments.value = comments.value.filter(comment => comment.cmtId !== cmtId);
            showReplyDialog.value = false;
          });
        }
      }
      else {
        const confirmDelete = confirm("确定要删除这个评论吗?");
        if (confirmDelete) {
          const data = {
            postId: postId,
            cmtId: cmtId,
          };
          // 调用后端删除接口
          post(`/posts/deleteCmt/${cmtId}`, data, (message, data) => {
            ElMessage.success("评论删除成功！");
            // 删除本地的评论数据
            comments.value = comments.value.filter(comment => comment.cmtId !== cmtId);
            showReplyDialog.value = false;
          });
        }
      }
    };

    function sendMsg(str, toId) {
      post(`/chats/add`, {
        message: str,
        fromId: 3,
        toId: toId,
      }, (message, data) => {
        //ElMessage("不能发送空白消息");
      });
    }

    /** 删帖 **/
    const deletePost = () => {
      if (userId === 3 && postAuthorId.value !== 3) {
        // 管理员进行删帖
        const confirmDelete = confirm("尊敬的管理员您好，确定要删除这个帖子吗?\n删除后将通知该用户");
        if (confirmDelete) {
          const data = {
            postId: postId,
          };
          sendMsg("from管理员的信息: 【" +
              postDetail.value.postAuthor.name + "】同学你好，你的标题为 \"" + postDetail.value.postTitle +
              "\" 的帖子已被管理员删除！", postAuthorId.value);
          // 调用后端删除接口
          post(`/posts/delete/${postId}`, data, (message, data) => {
            ElMessage.success("帖子删除成功，已告知该用户");
            router.push('/home/posts');
          });
        }
      } else {
        const confirmDelete = confirm("确定要删除这个帖子吗?");
        if (confirmDelete) {
          const data = {
            postId: postId,
          };
          // 调用后端删除接口
          post(`/posts/delete/${postId}`, data, (message, data) => {
            ElMessage.success("帖子删除成功");
            router.push('/home/posts');
          });
        }
      }
    }

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

    /****** 关于评论框 ********/
    const showReplyDialog = ref(false);
    const replyContent = ref("");
    const atWhom=ref('楼主');

    /***回复别的评论（@）***/
    const replyByClick = async (str) => {
      atWhom.value=str;
      openReplyDialog();
    }

    const submitReply = async () => {
      if (replyContent.value.length === 0) {
        ElMessage.warning("评论内容不能为空");
        return;
      }
      const replyData = {
        postId: postId,
        cmtAuthorId: userId,
        content: "@"+atWhom.value+" "+replyContent.value,
      };
      console.log(replyData);
      post(`/posts/addCmt`, replyData,
          (message, data) => {
            ElMessage.success("评论成功");
            closeReplyDialog(); // 关闭对话框
            fetchPostDetail(postId);
            //console.log(comments.value);
          }
      )
    }

    const openReplyDialog = () => {
      showReplyDialog.value = true; // 显示对话框
      replyContent.value = ""; // 清空之前的内容
    };
    const closeReplyDialog = () => {
      showReplyDialog.value = false; // 关闭对话框
      replyContent.value = ""; // 清空输入框内容
    };

    const navigateTo=(to)=>{
      router.push(`/home/profile/${to}`);
    }

    return {
      postId, postDetail, comments, userId, postAuthorId,
      deleteCmt,
      showReplyDialog, replyContent,updateContent,
      fetchPostDetail,
      likePost, starPost,
      submitReply, openReplyDialog, closeReplyDialog,replyByClick,
      getRandomColor,
      deletePost,
      navigateTo,
    }
  }
};
</script>

<style scoped>
/* 全局样式 */
.post-content img {
  width: 70%;
  height: auto; /* 保持图片的纵横比 */
  object-fit: cover; /* 保证图片在50%的宽度内不会变形 */
  margin: 10px 0; /* 添加一些上下边距来提高视觉效果 */
  display: block; /* 确保图片为块级元素，便于控制 */
  max-width: 100%; /* 防止图片超出容器 */
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  color: #333;
}

/* 帖子容器 */
.post-container {
  width: 70%;
  max-width: 900px;
  margin: 40px auto;
  background: linear-gradient(135deg, rgba(172, 186, 223, 0.79), #FCFDE9FF); /* 渐变背景 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
  box-shadow 0.3s ease-in-out,
  filter 0.3s ease-in-out;  /* 添加平滑过渡 */
}

.avatar:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  filter: brightness(1.2);
}

.post-title {
  flex: 1;
}

.post-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.username {
  margin: 5px 0 0;
  font-size: 16px;
  color: #888;
}

.divider {
  border-bottom: 1px solid #eee;
  margin: 20px 0;
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: #444;
}

.post-date {
  font-size: 14px;
  color: #797979;
  margin-top: 20px;
  text-align: right;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.action-button {
  background-color: #fff;
  border: 2px solid #dadada; /* 默认没有边框 */
  border-radius: 10px;
  padding: 3px 3px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  font-weight: 550;
  width: 80px;
}

/* 删除按钮的样式 */
.action-button.delete {
  color: #d9534f;
}

/* 添加每个按钮的颜色变化 */
.action-button .icon {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.action-button:hover .icon {
  transform: scale(1.2); /* 鼠标悬停时图标放大 */
}

/* "点赞" 按钮被点击时的样式 */
.action-button.liked {
  border-color: red;  /* 当isLiked为true时，边框变为红色 */
  background-color: rgba(255, 211, 211, 0.87);  /* 让背景色更清爽 */
  color: red;  /* 改变文本和图标的颜色 */
}

/* "收藏" 按钮 */
.action-button.bookmarked {
  background-color: rgba(255, 239, 194, 0.75);
  color: #735800;
  border-color: #ffbf00;
}

.action-button.delete:hover {
  background-color: #f1f1f1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.action-button.delete:active {
  background-color: #f0d6d6;
}


.reply-dialog {
  padding-top: 30px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background-color: #D6DDE5FF;
  padding: 20px;
  width: 80%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  resize: none;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.dialog-actions button {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-actions button:hover {
  background-color: #3077C1;
}

/* 评论区 */
.comments {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 5px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);  /* 添加柔和的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.comment-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);  /* 更深的阴影 */
  cursor: pointer;
}

/* 评论头像 */
.comment-avatar {
  margin-top: 10px;
  margin-left: 10px;
  width: 50px;
  height: 50px;
  border-radius: 50%;  /* 圆形头像 */
  object-fit: cover;
  border: 2px solid #464646;  /* 轻微的边框 */
}

/* 评论作者 */
.comment-author {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding-left: 10px;
  margin-top: 0px;
  margin-left: 10px;
}

.comment-date {
  font-size: 12px;
  color: #797979;
  /* 分别设置 top, right, bottom, left 的 padding */
  margin: 30px 20px 0px 0px;
}

.comment-content {
  width: 800px;
  /* 分别设置 top, right, bottom, left 的 padding */
  margin: 20px 10px 20px 20px;
}

/* 评论内容 */
.comment-content p {
  font-size: 20px;
  color: #2d2d2d;
  line-height: 1.5;
}

.delete-comment-btn {
  color: #d9534f;
  background-color: #fff;
  border: 2px solid #dadada; /* 默认没有边框 */
  border-radius: 10px;
  padding: 3px 3px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  font-weight: 550;
  width: 45px;
  min-width: 40px;
}

.delete-comment-btn:hover {
  border: 2px solid #e04343;
  background-color: rgba(224, 67, 67, 0.18);
}

</style>


