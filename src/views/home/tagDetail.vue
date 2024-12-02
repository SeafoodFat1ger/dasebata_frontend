<template>
  <el-header>
    <TopHeader/>
  </el-header>


  <div class="discussion-page">
    <el-card class="card header-card">
      <div class="header-content">
        <div>
          <h1># {{ tagStr }}</h1>
          <span>共 {{ totalPosts }} 篇帖子</span> | <span> {{ totalQuestions }} 个提问</span>
        </div>
        <el-button
            type="primary"
            @click="drawer = true"
            size="large"
            circle>
          <el-icon>
            <Plus/>
          </el-icon>
        </el-button>


      </div>
    </el-card>

    <!-- 提问和文章列表卡片 -->
    <el-card class="card content-card">

      <el-tabs v-model="activeTab" class="tabs">

        <el-tab-pane label="帖子" name="articles">
          <div class="post-list" @scroll="onScroll" ref="postList">
            <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="false"/>
          </div>
        </el-tab-pane>

        <el-tab-pane label="提问" name="questions">
          <div class="post-list" @scroll="onScroll" ref="postList">
            <PostItem v-for="post in questions" :key="post.postId" :post="post" :needTag="false"/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>

  <!--rich text-->
  <el-drawer v-model="drawer" size="80%" direction="btt" title="发布帖子">
    <el-form :model="form">
      <el-form-item label="标题">
        <el-input v-model="form.postTitle" placeholder="请输入标题" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="分区">
        <el-select
            v-model="form.postArea"
            placeholder="请选择分区"
        >
          <el-option label="学习生活" value="1"/>
          <el-option label="日常事务" value="2"/>
          <el-option label="情感交流" value="3"/>
          <el-option label="潜水吐槽" value="4"/>
          <el-option label="寻找作乐" value="5"/>
        </el-select>
      </el-form-item>

      <el-form-item label="话题" style="display: flex; align-items: center;">
        <el-tag>{{ tagStr }}</el-tag>
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
            list-type="picture-card"
            :action="'http://47.93.187.154:8082/posts/uploadImg'"
            :on-change="handleChange"
            :before-remove="beforeRemove"
            :on-preview="handlePictureCardPreview"
            :file-list="fileList.front_file"
            multiple
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            name="img"
        >
        </el-upload>
      </el-form-item>


    </el-form>


    <myEditor @update:content="updateContent"/>
    <div>
      <h3>当前内容:</h3>
      <div v-html="form.postContent"></div>
    </div>

    <!-- 预览图片的弹窗 -->
    <el-dialog
        v-model="previewDialogVisible"
        :visible.sync="previewDialogVisible"
        :title="previewTitle"
        :width="'50%'"
        :before-close="handleClosePreview"
    >
      <img
          v-if="previewImage"
          :src="previewImage"
          alt="Preview Image"
          class="preview-image"
      />
    </el-dialog>

    <div class="demo-drawer__footer">
      <el-button @click="cancelForm">Cancel</el-button>
      <el-button type="primary" @click="submitPost">Submit</el-button>
    </div>
  </el-drawer>
</template>

<script>
import {reactive, ref, computed, onMounted, watch} from "vue";
import TopHeader from "@/views/TopHeader.vue";
import {useRoute} from "vue-router";
import PostItem from "@/components/PostItem.vue";
import {get} from "@/net/index.js";
import myEditor from "@/components/Editor.vue";
import {ElMessage, ElMessageBox, ElTag} from "element-plus";
import {useStore} from "@/stores";
import {Star, Plus} from "@element-plus/icons-vue";

const store = useStore()
export default {
  components: {ElTag, Plus, Star, myEditor, PostItem, TopHeader},
  setup() {
    const form = reactive({
      postTitle: '',
      postArea: '',
      postContent: '',
    })
    let drawer = ref(false);
    const userId = store.auth.user.id;


    const inputValue = ref('');

    const route = useRoute();
    const activeTab = ref("articles");
    const sortOrder = ref("updated");
    const tagStr = ref('');
    const questions = ref([]);
    const posts = ref([]);

    const totalQuestions = ref(0);
    const totalPosts = ref(0);
    const loadingPost = ref(false);  // 用于控制是否正在加载
    const loadingProblem = ref(false);

    const fetchPosts = async (pageNumber = 1) => {
      if (loadingPost.value) return;  // 如果正在加载，直接返回
      loadingPost.value = true;  // 设置为加载状态
      get(`/posts/getTag/post/${tagStr.value}/${pageNumber}/10`, (message, data) => {
        posts.value.push(...data.records);  // 新的帖子添加到原来列表中
        totalPosts.value = data.total;
        loadingPost.value = false;  // 数据加载完成
      });
    };

    const fetchProblem = async (pageNumber = 1) => {
      if (loadingProblem.value) return;
      loadingProblem.value = true;
      get(`/posts/getTag/problem/${tagStr.value}/${pageNumber}/10`, (message, data) => {
        questions.value.push(...data.records);  // 新的提问添加到原来列表中
        totalQuestions.value = data.total;
        loadingProblem.value = false;
      });
    };

    const onScroll = (event) => {
      // 获取容器的总高度、已滚动的高度和可视区域的高度
      const scrollHeight = event.target.scrollHeight;
      const scrollTop = event.target.scrollTop;
      const clientHeight = event.target.clientHeight;


      // 判断是否滚动到底部，设置容差值
      const bottom = scrollTop + clientHeight >= scrollHeight - 50; // 允许 50px 的容差

      if (bottom && !loadingPost.value) {
        if (activeTab.value === "articles") {
          const currentPage = Math.ceil(posts.value.length / 10); // 计算当前页数
          fetchPosts(currentPage + 1);  // 加载下一页的帖子
        } else {
          const currentPage = Math.ceil(questions.value.length / 10); // 计算当前页数
          fetchProblem(currentPage + 1);  // 加载下一页的提问
        }
      }
    };


    const updateContent = async (newContent) => {
      form.postContent = newContent; // 更新父组件的内容
    };


    const cancelForm = () => {
      drawer.value = false;
    }


    const submitPost = async () => {
      if (!form.postTitle || !form.postArea || !form.postContent) {
        ElMessage.warning("请填写完整帖子信息")
        return
      }

      if(!form.avatar){
        form.avatar = 'http://47.93.187.154:8082/imgview/1733126975372tmp.png';
      }
      const userId = store.auth.user.id;

      const requestData = {
        "userId": userId,
        "postTitle": form.postTitle,
        "postArea": form.postArea,
        "postTags": tags.value,
        "postType": "post",
        "postContents": [
          {
            "type": "text",
            "data": form.postContent,
          },
          {
            "type": "image",
            "data": form.avatar,
          },
        ]
      }
      post(`/posts/add`, requestData,
          (message) => {
            ElMessage.success(message)
            drawer.value = false;
            fetchPosts(activeArea.value, 1);
          }
      )

    };


    // 上传图片
    const fileList = ref([]);
    const handleChange = file => {
      if (file.status == "success") {
        fileList.value = [];
        fileList.value.push(file.response);
        form.avatar = file.response.data;
      }
    };
    // 删除
    const beforeRemove = () => {
      const result = new Promise((resolve, reject) => {
        ElMessageBox.confirm("此操作将删除该图片, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
            .then(() => {
              resolve();
              form.avatar = '';
            })
            .catch(() => {
              reject(false);
            });
      });
      return result;
    };

    const handleExceed = () => {
      ElMessage("只能上传一张");
    }

    const previewDialogVisible = ref(false);  // 控制预览弹窗显示
    const previewImage = ref('');  // 存储预览的图片
    const previewTitle = ref('图片预览');  // 预览图片的标题

    const handlePictureCardPreview = (file) => {
      // 获取点击的图片，并设置为预览图片
      previewImage.value = file.url || URL.createObjectURL(file.raw);
      previewDialogVisible.value = true; // 打开图片预览弹窗
    };
    const handleClosePreview = () => {
      previewDialogVisible.value = false;
    };
    const beforeUpload = (file) => {
      const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2; // 限制文件大小为 2MB

      if (!isJpgOrPng) {
        ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
      }

      return isJpgOrPng && isLt2M;  // 如果格式和大小都符合，返回 true 继续上传
    };


    onMounted(() => {
      tagStr.value = route.params.tagStr;
      fetchPosts();
      fetchProblem();
    });

    return {
      tagStr,
      form,
      drawer,

      inputValue,

      posts,
      activeTab,
      questions,
      totalQuestions,
      totalPosts,
      sortOrder,
      onScroll,
      cancelForm,
      submitPost,
      updateContent,


      fileList,
      handleChange,
      beforeRemove,
      handleExceed,
      previewDialogVisible,
      previewTitle,
      handleClosePreview,
      previewImage,
      handlePictureCardPreview,
      beforeUpload
    };
  },
};
</script>

<style>
/* 页面整体样式 */
.discussion-page {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #ffffff;
}

/* 卡片公共样式 */
.card {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 标题和描述卡片样式 */
.header-card .header-content {
  display: flex;
  padding: 16px;
  justify-content: space-between;

}

/* 提问和文章列表卡片样式 */
.content-card .content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-list {
  max-height: 600px; /* 限制最大高度 */
  overflow-y: auto; /* 允许垂直滚动 */
}
</style>
