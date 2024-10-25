<template>
  <el-container class="content">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <el-button type="primary" style="margin-left: 16px" @click="drawer = true">
        发起帖子 {{ drawer }}
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
    </el-form>


    <div>
      <el-input
          v-model="inputValue"
          placeholder="输入话题，使用#开头"
          @input="handleInput"
      />


      <el-autocomplete
          size="small"
          style="width: 250px"
          v-model="inputValue"
          value-key="name"
          :fetch-suggestions="querySearchAsync"
          clearable
          placeholder="请输入话题，使用#开头"
          @select="handleTagSelect"
      />


      <div>
        <el-tag
            v-for="tag in tags"
            closable
            @close="removeTag(tag)"
        >{{ tag }}
        </el-tag>
      </div>


      <!--      <el-dropdown v-if="!isNewTagVisible">-->
      <!--          <el-dropdown-item-->
      <!--              v-for="tag in tagSuggestions"-->
      <!--              :key="tag.tagId"-->
      <!--              @click="addTag(tag)"-->
      <!--          >{{ tag.tagTitle }}-->
      <!--          </el-dropdown-item>-->
      <!--      </el-dropdown>-->

      <el-button
          v-if="isNewTagVisible === true"
          @click="createTag"
          type="primary"
      >新建话题 "{{ newTag }}"
      </el-button>
    </div>


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
import {get} from '@/net';
import {useStore} from "@/stores";

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
    let posts = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const pageSizes = [10, 20, 30, 40];
    let total = ref(100);
    const background = ref(true);
    const disabled = ref(false);
    let isNewTagVisible = ref(false);
    const inputValue = ref('');
    const tags = ref([]);
    const newTag = ref('');
    const activeArea = ref(0);
    const tagSuggestions = ref([
      {

        id: 1, name: '暗黑破坏神2'
      },
      {

        id: 2, name: '国家崛起2'
      },
      {

        id: 3, name: '帝国时代4'
      },
      {

        id: 4, name: '红色警戒'
      },
      {

        id: 5, name: '肆狂神战纪'
      },
      {

        id: 6, name: '艾诺迪亚'
      },
      {

        id: 7, name: '地下城守护者2'
      },
    ])


    // 获取帖子数据
    const fetchPosts = async (areaId = 0, pageNumber = 1) => {
      get(`/posts/get/${areaId}/${pageNumber}`, (message, data) => {
            posts.value = data.posts
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
      }
      console.log(form.postArea)
      const userId = store.auth.user.userId;
      const requestData = {
        userId,
        postTitle: form.postTitle,
        postArea: form.postArea,
      }

    };

    const handleAreaChange = async (area) => {
      activeArea.value = area;
      currentPage.value = 1;
      await fetchPosts(activeArea.value, 1);
    };

    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchPosts(activeArea.value, page); // 请求新数据
    };

    const updateContent = async (newContent) => {
      form.postContent = newContent; // 更新父组件的内容
    };


    const handleTagSelect = (item) => {

      addTag(item)
      console.log(item)
    }


    const querySearchAsync = (queryString, cb) => {
      const results = queryString
          ? []
          : tagSuggestions.value

      console.log(isNewTagVisible.value)
      cb(results)
      if (results.length === 0) {
        isNewTagVisible.value = true
        newTag.value = inputValue
      }else{
        isNewTagVisible.value = false
        newTag.value = ''
      }
    }


    const handleInput = () => {
      const first = inputValue.value.charAt(0);
      if (first === '#') {
        const topic = inputValue.value.substring(1);
        // console.log(topic);
        checkTopicExistence(topic);
      } else {
        ElMessage.warning("话题以#开头")
      }
    };
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
      //TODO post creat
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
