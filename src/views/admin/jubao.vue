<template>

    <!-- 右侧内容区域 -->
    <el-main>
      <el-card shadow="never" class="report-card">
        <h2>举报管理</h2>

        <!-- 举报筛选区域 -->
        <el-row class="filter-row" :gutter="20">
          <el-col :span="8">
            <el-select v-model="filters.reportType" placeholder="选择举报类型" clearable>
              <el-option label="血腥暴力" value="1"></el-option>
              <el-option label="低俗色情" value="2"></el-option>
              <el-option label="造谣生事" value="3"></el-option>
              <el-option label="恶意攻击" value="4"></el-option>
              <el-option label="垃圾信息" value="5"></el-option>
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-select v-model="filters.reportTarget" placeholder="选择举报对象" clearable>
              <el-option label="帖子" value="post"></el-option>
              <el-option label="评论" value="comment"></el-option>
              <el-option label="用户" value="user"></el-option>
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-button type="primary" @click="searchReports">筛选</el-button>
          </el-col>
        </el-row>

        <!-- 举报列表 -->
        <el-table
            :data="reports"
            style="width: 100%; margin-top: 20px;"
            stripe
            border
            size="medium"
        >
          <el-table-column prop="id" label="举报ID" width="100"></el-table-column>
          <el-table-column prop="reportType" label="举报类型" width="150"></el-table-column>
          <el-table-column prop="reportTarget" label="举报对象" width="150"></el-table-column>
          <el-table-column prop="content" label="举报内容" width="400"></el-table-column>
          <el-table-column label="操作" width="200">
            <template v-slot="scope">
              <el-button
                  size="mini"
                  type="danger"
                  @click="deleteReport(scope.row.id)"
              >删除举报</el-button>
              <el-button
                  size="mini"
                  type="warning"
                  @click="handleAction(scope.row)"
              >删除内容</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>

</template>

<script>
import { ref } from "vue";
import { ElContainer, ElAside, ElMenu, ElMenuItem, ElMain, ElCard, ElRow, ElCol, ElSelect, ElOption, ElButton, ElTable, ElTableColumn } from "element-plus";

export default {
  name: "ReportManagement",
  components: {
    ElContainer,
    ElAside,
    ElMenu,
    ElMenuItem,
    ElMain,
    ElCard,
    ElRow,
    ElCol,
    ElSelect,
    ElOption,
    ElButton,
    ElTable,
    ElTableColumn,
  },
  setup() {
    const reports = ref([
      { id: 1, reportType: "血腥暴力", reportTarget: "帖子", content: "这是一个血腥暴力的帖子内容" },
      { id: 2, reportType: "低俗色情", reportTarget: "评论", content: "这是一条低俗色情的评论" },
      { id: 3, reportType: "造谣生事", reportTarget: "用户", content: "此用户传播虚假信息" },
    ]);
    const filters = ref({
      reportType: "",
      reportTarget: "",
    });

    // 查询举报列表
    const searchReports = () => {
      // 后端接口调用示例
      // axios.get('/api/reports', { params: filters.value }).then(response => {
      //   reports.value = response.data;
      // });
      console.log("Filters:", filters.value);
    };

    // 删除举报
    const deleteReport = (id) => {
      // 后端接口调用示例
      // axios.delete(`/api/reports/${id}`).then(() => {
      //   reports.value = reports.value.filter(report => report.id !== id);
      // });
      console.log("Deleted Report ID:", id);
    };

    // 处理举报内容（删除帖子/评论/用户等）
    const handleAction = (report) => {
      switch (report.reportTarget) {
        case "post":
          // 删除帖子接口调用
          console.log("删除帖子", report);
          break;
        case "comment":
          // 删除评论接口调用
          console.log("删除评论", report);
          break;
        case "user":
          // 删除用户接口调用
          console.log("删除用户", report);
          break;
      }
    };

    return {
      reports,
      filters,
      searchReports,
      deleteReport,
      handleAction,
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
