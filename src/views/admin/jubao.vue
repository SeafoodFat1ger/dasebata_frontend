<template>

  <!-- 右侧内容区域 -->
  <el-main>

    <h2>用户管理</h2>

    <!-- 用户列表 -->
    <el-table
        :data="posts"
        style="width: 100%; margin-top: 20px;"
        stripe
        border
    >

      <el-table-column
          label="用户ID"
          prop="id"
      ></el-table-column>

      <el-table-column
          label="用户名"
          prop="username"
      ></el-table-column>

      <el-table-column label="头像" prop="avatar">
        <template v-slot="scope">
          <img :src="scope.row.avatar" alt="头像" style="width: 40px; height: 40px; border-radius: 50%;"/>
        </template>
      </el-table-column>

      <el-table-column label="最近登录时间" prop="lastLogin">
        <template v-slot="scope">
          <span>{{ formatDate(scope.row.lastLogin) }}</span>
        </template>
      </el-table-column>



      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button

              type="warning"
              @click="gotoPost(scope.row.id)"
          >查看详细
          </el-button>
          <el-button

              type="danger"
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
import {ElButton, ElCol, ElMessage, ElOption, ElRow, ElSelect,ElMessageBox} from 'element-plus';
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

    const router = useRouter();
    const posts = ref([]);
    const currentPage = ref(1);
    const currentPageSize = ref(10);
    const total = ref(10);
    const pageSizes = [10, 20, 30, 40];
    const background = ref(true);
    const disabled = ref(false);


    const formatDate = (timestamp) =>{
      if (!timestamp) return '没有访问过本网站';
      const date = new Date(timestamp); // 直接将 ISO 字符串传给 Date 对象
      return date.toLocaleString(); // 使用默认的本地化格式
    }



    // 获取帖子列表数据
    const fetchPosts = async (page = 1, pageSize = 10) => {
      get(`/users/getAll/${page}/${pageSize}`, (message, data) => {
        posts.value = data.records;
        total.value = data.total;
      });
    };

    // 页码变化
    const handlePageSizeChange = async (pageSizes) => {
      currentPageSize.value = pageSizes;
      await fetchPosts(currentPage.value, currentPageSize.value);
    };

    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchPosts(page, currentPageSize.value);
    };

    // 查看帖子详情
    const gotoPost = async (id) => {


      const url = router.resolve({
        path: `/home/profile/${id}`,
      });
      window.open(url.href);
    };

    // 删除帖子
    const deletePost = async (user) => {
      try {
        // 管理员进行删帖，弹出确认框
        const confirmDelete = await ElMessageBox.confirm(
            "尊敬的管理员您好，确定要删除这个用户吗?",
            "删除确认", // 标题
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
        );

        // 如果用户确认删除
        if (confirmDelete) {
          const data = {
            userId: user.id,
          };

          // 调用后端删除接口
          post(`/users/delete/${user.id}`, data, (message, data) => {
            ElMessage.success("用户删除成功");
            fetchPosts(currentPage.value, currentPageSize.value);
          });
        }
      } catch (error) {
        // 如果用户点击取消或关闭弹窗
        if (error === "cancel") {
          ElMessage.info("删除操作已取消");
        }
      }
    }


    // 在组件挂载时获取初始数据
    fetchPosts(currentPage.value, currentPageSize.value);

    return {
      formatDate,
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
