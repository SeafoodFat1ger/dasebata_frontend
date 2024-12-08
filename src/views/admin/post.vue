<template>

  <!-- 右侧内容区域 -->
  <el-main>

    <h2>内容管理</h2>

    <!-- 举报筛选区域 -->
    <el-row class="filter-row" :gutter="20">


      <el-col :span="8">
        <el-select v-model="filters.reportType" placeholder="选择分区">
          <el-option label="全部" value="0"></el-option>
          <el-option label="学习生活" value="1"></el-option>
          <el-option label="日常事务" value="2"></el-option>
          <el-option label="情感交流" value="3"></el-option>
          <el-option label="潜水吐槽" value="4"></el-option>
          <el-option label="寻找作乐" value="5"></el-option>
        </el-select>
      </el-col>

      <el-col :span="8">
        <el-select v-model="filters.reportTarget" placeholder="选择问题或者帖子">
          <el-option label="帖子" value="post"></el-option>
          <el-option label="问题" value="problem"></el-option>
        </el-select>
      </el-col>

      <el-col :span="8">
        <el-button type="primary" @click="filterPosts">筛选</el-button>
      </el-col>
    </el-row>

    <!-- 举报列表 -->
    <el-table
        :data="posts"
        style="width: 100%; margin-top: 20px;"
        stripe
        border
    >

      <!-- 帖子ID -->
      <el-table-column
          label="内容ID"
          prop="postId"
      ></el-table-column>

      <!-- 帖子标题 -->
      <el-table-column
          label="内容标题"
          prop="postTitle"
      ></el-table-column>

      <el-table-column
          label="发布人ID"
          prop="postAuthor.id"
      ></el-table-column>

      <!-- 用户名 -->
      <el-table-column
          label="发布人"
          prop="postAuthor.name"
      ></el-table-column>


      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button

              type="danger"
              @click="gotoPost(scope.row.postId)"
          >查看详细
          </el-button>
          <el-button

              type="warning"
              @click="deletePost(scope.row)"
          >删除内容
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="currentPageSize"
          :page-sizes="pageSizes"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
      />
    </div>
  </el-main>

</template>

<script>
import {ref} from 'vue';
import {post, get} from '@/net';
import {useStore} from "@/stores";
import {ElButton, ElCol, ElMessage, ElOption, ElRow, ElSelect} from 'element-plus';
import {useRouter} from "vue-router";
import router from "@/router/index.js";
import {Search} from "@element-plus/icons-vue";

const store = useStore();

export default {
  computed: {
    Search() {
      return Search
    }
  },
  components: {ElButton, ElRow, ElSelect, ElCol, ElOption},
  setup() {
    const searchQuery = ref(""); // 搜索框的值
    const router = useRouter();
    const posts = ref([]);
    const currentPage = ref(1);
    const currentPageSize = ref(10);
    const total = ref(10);
    const pageSizes = [10, 20, 30, 40];
    const background = ref(true);
    const disabled = ref(false);
    const activeArea = ref(0);
    const postType = ref('post');  // 你可以根据需求修改这个值

    const filters = ref({
      reportType: "0",
      reportTarget: "post",
    });

    const filterPosts = async () => {
      postType.value = filters.value.reportTarget;
      activeArea.value = filters.value.reportType;
      await fetchPosts(postType.value);
    }

    // 获取帖子列表数据
    const fetchPosts = async (postType = 'post', page = 1, pageSize = 10) => {
      get(`/posts/get/${postType}/${activeArea.value}/${page}/${pageSize}`, (message, data) => {
        posts.value = data.records;
        total.value = data.total;
      });
    };

    // 页码变化
    const handlePageSizeChange = async (pageSizes) => {
      currentPageSize.value = pageSizes;
      await fetchPosts(postType.value, currentPage.value, currentPageSize.value);
    };

    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchPosts(postType.value, page, currentPageSize.value);
    };

    // 查看帖子详情
    const gotoPost = async (postId) => {


      const url = router.resolve({
        path: `/home/postDetail/${postId}`,
      });
      window.open(url.href);
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

    // 删除帖子
    const deletePost = async (postDetail) => {

      // 管理员进行删帖
      const confirmDelete = confirm("尊敬的管理员您好，确定要删除这个帖子吗?\n删除后将通知该用户");
      if (confirmDelete) {
        const data = {
          postId: postDetail.postId,
        };
        sendMsg("from管理员的信息: 【" +
            postDetail.postAuthor.name + "】同学你好，你的标题为 \"" + postDetail.postTitle +
            "\" 的帖子已被管理员删除！", postDetail.postAuthor.id);
        // 调用后端删除接口
        post(`/posts/delete/${postDetail.postId}`, data, (message, data) => {
          ElMessage.success("帖子删除成功，已告知该用户");
          fetchPosts(postType.value, currentPage.value, currentPageSize.value);
        });
      }

    }

    // 在组件挂载时获取初始数据
    fetchPosts(postType.value, currentPage.value, currentPageSize.value);

    return {
      posts,
      currentPage,
      currentPageSize,
      total,
      pageSizes,
      disabled,
      background,
      handlePageSizeChange,
      handlePageChange,
      gotoPost,
      deletePost,
      filters,
      filterPosts,
      searchQuery,

    };
  }
};
</script>

<style scoped>
.sidebar {
  background-color: #2c3e50;
  padding: 20px;
}

.report-card {
  padding: 20px;
  border-radius: 10px;
  background-color: #ecf0f1;
  margin-top: 20px;
}

h2 {
  font-size: 24px;
  color: #34495e;
  font-weight: bold;
}

.filter-row {
  margin-bottom: 20px;
}

.el-table th {
  background-color: #f7f9fb;
}

.el-button {
  margin-left: 10px;
}

.el-button[type="danger"] {
  background-color: #f56c6c;
  color: #fff;
}

.el-button[type="warning"] {
  background-color: #e6a23c;
  color: #fff;
}

.el-table .cell {
  word-wrap: break-word;
  word-break: break-all;
}
</style>
