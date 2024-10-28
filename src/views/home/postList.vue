<template>
  <el-container class="content">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <el-button type="primary" style="margin-left: 16px" @click="drawer = true">
        发起帖子
      </el-button>
      <el-menu
          default-active="0"
          class="el-menu-vertical-demo"
      >
        <el-menu-item
            index="0"
            @click="handleAreaChange(0)">全部
        </el-menu-item>
        <el-menu-item
            index="1"
            @click="handleAreaChange(1)">学习生活
        </el-menu-item>
        <el-menu-item
            index="2"
            @click="handleAreaChange(2)">日常事务
        </el-menu-item>
        <el-menu-item
            index="3"
            @click="handleAreaChange(3)">情感交流
        </el-menu-item>
        <el-menu-item
            index="4"
            @click="handleAreaChange(4)">潜水吐槽
        </el-menu-item>
        <el-menu-item
            index="5"
            @click="handleAreaChange(5)">寻找作乐
        </el-menu-item>
      </el-menu>

    </el-aside>
    <el-main>
      <div>
        <PostItem v-for="post in posts" :key="post.postId" :post="post"/>
      </div>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :disabled="disabled"
          :background="background"
          layout="prev, pager, next, sizes, jumper"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
      />
    </el-main>
  </el-container>

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
        <el-autocomplete
            v-model="inputValue"
            value-key="name"
            :fetch-suggestions="querySearchAsync"
            clearable
            placeholder="请输入话题"
            @select="handleTagSelect"
            style="flex: 1;"
        />
        <el-button
            :disabled="isNewTagVisible === false || inputValue === ''"
            @click="createTag"
            type="primary"
            style="margin-left: auto;"
        >
          新建话题
        </el-button>
      </el-form-item>


      <el-form-item label="">
        <el-tag
            v-for="tag in tags"
            closable
            @close="removeTag(tag)"
        >{{ tag }}
        </el-tag>
      </el-form-item>
    </el-form>


    <myEditor @update:content="updateContent"/>
    <div>
      <h3>当前内容:</h3>
      <div v-html="form.postContent"></div>
    </div>
    <div class="demo-drawer__footer">
      <el-button @click="cancelForm">Cancel</el-button>
      <el-button type="primary" @click="submitPost">Submit</el-button>
    </div>
  </el-drawer>
</template>

<script>
import {ElAvatar, ElTag, ElIcon, ElPagination, ElMessage} from 'element-plus';
import {ChatLineSquare} from "@element-plus/icons-vue";
import myEditor from "../../components/Editor.vue";
import router from "@/router";
import {reactive, ref} from 'vue';
import PostItem from "@/components/PostItem.vue";
import {post, get} from '@/net';
import {useStore} from "@/stores";
import message from "@element-plus/icons/lib/Message.js";

const store = useStore()

export default {
  components: {
    PostItem,
    myEditor,
    ElAvatar,
    ElTag,
    ElIcon,
    ElPagination,
    ChatLineSquare,
  },
  setup() {
    const form = reactive({
      postTitle: '',
      postArea: '',
      postContent: '',
    })
    let drawer = ref(false);
    const posts = ref([]);
    const currentPage = ref(1);
    const currentPageSize = ref(10);
    const pageSize = ref(10);
    const pageSizes = [10, 20, 30, 40];
    const total = ref(0);
    const background = ref(true);
    const disabled = ref(false);
    let isNewTagVisible = ref(false);
    const inputValue = ref('');
    const tags = ref([]);
    const newTag = ref('');
    const activeArea = ref(0);
    const tagSuggestions = ref([])


    // 获取帖子数据
    const fetchPosts = async (areaId = 0, pageNumber = 1) => {
      get(`/posts/get/post/${areaId}/${pageNumber}/${currentPageSize.value}`, (message, data) => {
            posts.value = data.records
            total.value = data.postsTotal
          }
      )
    }
    const cancelForm = () => {
      drawer.value = false;
    }


    const submitPost = async () => {
      if (!form.postTitle || !form.postArea || !form.postContent) {
        ElMessage.warning("请填写完整帖子信息")
        return
      }

      const userId = store.auth.user.id;

      const requestData = {
        "userId": userId,
        "postTitle": form.postTitle,
        "postArea": form.postArea,
        "postTags": [],
        "postType": "post",
        "postContents": [
          {
            "type": "text",
            "data": form.postContent,
          },
          {
            "type": "image",
            "data": "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png",
          },
        ]
      }
      post(`/posts/add`, requestData,
          (message) => {
            ElMessage.success(message)
            drawer.value = false;
            fetchPosts(activeArea.value, 0);
          }
      )

    };

    const handleAreaChange = async (area) => {
      activeArea.value = area;
      currentPage.value = 1;
      await fetchPosts(activeArea.value, 1);
    };

    const handlePageSizeChange = async (pageSizes) => {
      currentPageSize.value = pageSizes;
      await fetchPosts(activeArea.value, currentPage.value); // 请求新数据
    }


    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchPosts(activeArea.value, page); // 请求新数据
    };

    const updateContent = async (newContent) => {
      form.postContent = newContent; // 更新父组件的内容
    };


    const handleTagSelect = (item) => {
      if (tags.size() > 5) {
        ElMessage.warning("话题数不能多于5个");
        return;
      }
      inputValue.value = '';
      isNewTagVisible.value = false;
      addTag(item);
      console.log(item)
    }


    const querySearchAsync = (queryString, cb) => {
      if (queryString.length === 0) {
        return;
      }

      //TODO 接口！！！！！！
      checkTopicExistence(queryString);

      const results = queryString
          ? []
          : tagSuggestions.value

      cb(results)

      if (results.length === 0) {
        isNewTagVisible.value = true
        newTag.value = queryString
      } else {
        isNewTagVisible.value = false
        newTag.value = ''
      }


    }


    const checkTopicExistence = async (topic) => {

      // const response = await fetch(`/api/topics/check?name=${topic}`);
      // const data = await response.json();
      if (true) {
        isNewTagVisible.value = true;
        newTag.value = topic;
      } else {
        isNewTagVisible.value = false;
        tagSuggestions.value = [
          {tagId: 1, tagTitle: "学习技巧"},
          {tagId: 2, tagTitle: "编程挑战"},
          {tagId: 3, tagTitle: "生活窍门"},
          {tagId: 4, tagTitle: "心理健康"},
          {tagId: 5, tagTitle: "情感交流"},
          {tagId: 6, tagTitle: "科技资讯"}
        ];
      }
    }


    const createTag = () => {
      //TODO 接口！！！！！！
      addTag(newTag.value)

      inputValue.value = '';
      isNewTagVisible.value = false;
      newTag.value = '';
    }

    const addTag = async (tag) => {
      tags.value.push(tag);
    }
    const removeTag = async (tag) => {
      tags.value = tags.value.filter(t => t !== tag);
    }

    // 在组件挂载时获取初始数据
    fetchPosts();

    return {
      form,
      drawer,
      posts,
      currentPage,
      pageSize,
      pageSizes,
      total,
      background,
      disabled,
      inputValue,
      tags,
      tagSuggestions,
      newTag,
      isNewTagVisible,
      handlePageSizeChange,
      handlePageChange,
      cancelForm,
      submitPost,
      updateContent,
      handleInput,
      checkTopicExistence,
      createTag,
      addTag,
      removeTag,
      handleAreaChange,
      handleTagSelect,
      querySearchAsync,
    };
  }
}
;
</script>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.content {
  padding-top: 60px;
}

.sidebar {
  width: 200px;
  margin-right: 20px;
}

.post-footer .el-icon {
  margin-right: 5px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
