<template>
  <el-header>
    <TopHeader/>
  </el-header>


  <div class="discussion-page">
    <el-card class="card header-card">
      <div class="header-content">
        <div>
          <h1># {{ tagStr }}</h1>
          <div style="padding-top: 20px">
            <span>共 {{ totalPosts }} 篇帖子</span> | <span> {{ totalQuestions }} 个提问</span>
          </div>
        </div>
        <el-button
            type="primary"
            @click="drawer = true"
            size="large"
        >
          发帖/提问
        </el-button>
      </div>
    </el-card>

    <!-- 提问和文章列表卡片 -->
    <el-card class="card content-card">

      <el-tabs v-model="activeTab" class="tabs">

        <el-tab-pane label="帖子" name="articles">
          <div style="display: flex; justify-content: flex-start; flex-wrap: wrap; gap: 10px; padding: 10px;"
               @scroll="onScroll" ref="postList">
            <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="true"/>
          </div>
        </el-tab-pane>

        <el-tab-pane label="提问" name="questions">
          <div style="display: flex; justify-content: flex-start; flex-wrap: wrap; gap: 10px; padding: 10px;"
               @scroll="onScroll" ref="postList">
            <PostItem v-for="post in questions" :key="post.postId" :post="post" :needTag="true"
                      :color="'rgba(228,231,255,0.82)'"/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>

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

    </el-form>


    <myEditor @update:content="updateContent"/>

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
import {get, post} from "@/net/index.js";
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
        posts.value.push(...data.records);
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
      const scrollHeight = event.target.scrollHeight;
      const scrollTop = event.target.scrollTop;
      const clientHeight = event.target.clientHeight;


      // 判断是否滚动到底部，设置容差值
      const bottom = scrollTop + clientHeight >= scrollHeight - 50; // 允许 50px 的容差

      if (bottom && !loadingPost.value) {
        if (activeTab.value === "articles") {
          const currentPage = Math.ceil(posts.value.length / 10);
          fetchPosts(currentPage + 1);
        } else {
          const currentPage = Math.ceil(questions.value.length / 10);
          fetchProblem(currentPage + 1);
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

      if (!form.avatar) {
        form.avatar = 'http://47.93.187.154:8082/imgview/1733126975372tmp.png';
      }
      const userId = store.auth.user.id;
      let postType = "post";
      if (activeTab.value === "articles") {
        postType = "post";
      } else {
        postType = "problem"
      }
      const requestData = {
        "userId": userId,
        "postTitle": form.postTitle,
        "postArea": form.postArea,
        "postTags": [tagStr.value],
        "postType": postType,
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

      console.log(requestData)
      post(`/posts/add`, requestData,
          (message) => {
            ElMessage.success(message)
            //drawer.value = false;
            fetchPosts(1);
          }
      )

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
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(129, 122, 122, 0.1);
}


.header-card .header-content {
  display: flex;
  justify-content: space-between;
}

.header-content h1 {
  font-size: 24px;
  color: #333;
  margin: 5px;
  font-weight: 600;
  letter-spacing: 1px;
}

.header-content span {
  font-size: 14px;
  color: #888;
  font-weight: 500;
  padding: 20px 10px;
}


.el-button {
  border-radius: 7px;
  background-color: rgba(232, 241, 255, 0.24);
  color: #fff;
  font-weight: 600;
  width: 80px;
  height: 30px;
  border: 1px solid #428ef1;
  margin-top: 50px;
  margin-right: 20px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.el-button:hover {
  background-color: #c8e4ff;
  transform: translateY(-2px); /* 鼠标悬停时上浮效果 */
}

.el-button:active {
  background-color: #003d7a;
  transform: translateY(0);
}


.el-button {
  margin-left: 10px;
}


.header-content div {
  flex-grow: 1;
}


.header-content div span {
  margin-left: 10px;
}


.content-card .content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-list {
  max-height: 600px;
  overflow-y: auto;
}
</style>
