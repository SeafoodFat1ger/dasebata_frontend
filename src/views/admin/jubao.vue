<template>
  <!-- 右侧内容区域 -->
  <el-main>
    <h2>举报管理</h2>

    <!-- 举报筛选区域 -->
    <el-row class="filter-row" :gutter="20">
      <el-col :span="8">
        <el-select v-model="filters.reason" placeholder="选择举报原因">
          <el-option label="全部" value="0"></el-option>
          <el-option label="血腥暴力" value="1"></el-option>
          <el-option label="低俗色情" value="2"></el-option>
          <el-option label="造谣生事" value="3"></el-option>
          <el-option label="恶意攻击" value="4"></el-option>
          <el-option label="垃圾信息" value="5"></el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-select v-model="filters.reportType" placeholder="选择举报类型">
          <el-option label="帖子" value="post"></el-option>
          <el-option label="评论" value="comment"></el-option>
          <el-option label="用户" value="user"></el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="filterReport">筛选</el-button>
      </el-col>
    </el-row>

    <!-- 举报列表 -->
    <el-table
        :data="reports"
        style="width: 100%; margin-top: 20px;"
        stripe
        border
    >
      <el-table-column v-for="col in dynamicColumns" :key="col.prop" :prop="col.prop" :label="col.label"
                       :width="col.width">
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button
              type="danger"
              @click="deleteReport(scope.row)"
          >删除举报
          </el-button>
          <el-button
              type="warning"
              @click="handleAction(scope.row)"
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
          :total="totalReports"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
      />
    </div>
  </el-main>
</template>

<script>
import {ref, computed} from 'vue';
import {get, post} from '@/net';
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

export default {
  setup() {
    const currentPage = ref(1);
    const currentPageSize = ref(10);
    const reports = ref([]);
    const filters = ref({
      reportType: 'post',
      reason: '0',
    });

    const reportType = ref('post')
    const reason = ref('0')

    const background = ref(true);
    const disabled = ref(false);

    const pageSizes = [10, 20, 30, 40];
    const totalReports = ref(0);

    // 动态列
    const dynamicColumns = computed(() => {
          switch (reportType.value) {
            case 'post':
              return [
                {prop: 'postId', label: '帖子ID'},
                {prop: 'postTitle', label: '帖子标题'},
                {prop: 'postAuthor.name', label: '作者'},
                {prop: 'postPublishDate', label: '发布日期'},
                {prop: 'postCommentNum', label: '评论数'},
                {prop: 'postLikeNum', label: '点赞数'},
                {prop: 'postBookmarkNum', label: '收藏数'},
              ];
            case 'comment':
              return [
                {prop: 'cmtId', label: '评论ID'},
                {prop: 'cmtContent', label: '评论内容'},
                {prop: 'cmtAuthor.name', label: '作者'},
                {prop: 'cmtPublishDate', label: '发布日期'}
              ];
            case 'user':
              return [
                {prop: 'id', label: '用户ID'},
                {prop: 'username', label: '用户名'},
                {prop: 'email', label: '邮箱'},
                {prop: 'profile', label: '简介'}
              ];
            default:
              return [];
          }
        })
    ;

    const filterReport = async () => {
      reportType.value = filters.value.reportType;
      reason.value = filters.value.reason;
      await fetchReports(reportType.value, reason.value);
    };

    // 获取帖子列表数据
    const fetchReports = async (reportType = 'post', reason = '0', page = 1, pageSize = 10) => {
      get(`/posts/getReport/${reportType}/${reason}/${page}/${pageSize}`,
          (message, data) => {
            reports.value = data.records;
            totalReports.value = data.total;
          }
      );
    };

    const handlePageSizeChange = async (pageSizes) => {
      currentPageSize.value = pageSizes;
      await fetchReports(reportType.value, reason.value, currentPage.value, currentPageSize.value);
    };

    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchReports(reportType.value, reason.value, page, currentPageSize.value);
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

    const handleAction = async (report) => {
      let url;
      let data;
      switch (reportType.value) {
        case 'post':
          url = `/posts/delete/${report.postId}`;
          data = {
            postId: report.postId,
          };
          sendMsg("from管理员的信息: 【" +
              report.postAuthor.name + "】同学你好，你的标题为 \"" + report.postTitle +
              "\" 的帖子已被管理员删除！", report.postAuthor.id);
          post(`/posts/delete/${report.postId}`, data, (message, data) => {
            ElMessage.success("帖子删除成功，已告知该用户");
            fetchReports(reportType.value, reason.value);
          });
          break;
        case 'comment':
          url = `/posts/deleteCmt/${report.cmtId}`;
          data = {
            postId: postId,
            cmtId: cmtId,
          };
          break;
        case 'user':
          url = `/users/delete/${report.id}`;
          break;
        default:
          console.error('未知的举报类型');
          return;
      }
    };


    const deleteReport = (report) => {
      // 处理举报内容（删除帖子/评论/用户等）
      console.log("Handle action for report:", report);
    };

    fetchReports();

    return {
      reports,
      filters,
      currentPage,
      currentPageSize,
      pageSizes,
      totalReports,
      background,
      disabled,
      dynamicColumns,
      fetchReports,
      handlePageSizeChange,
      handlePageChange,
      deleteReport,
      handleAction,
      filterReport
    };
  },
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
