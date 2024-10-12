<script>
export default {
  name: "CommentBox",
  props: {
    comment: {
      type: Object, required: true,
    }
  },
  methods: {
    reply() {

    }
  }
}

</script>

<template>
<!--  <div class="comment-box" @clic="reply">-->
<!--  </div>-->
  <el-card class="comment-box">
    <div class="comment-content">
      <el-avatar icon="el-icon-user" />
      <div class="comment-body">
        <div class="comment-header">
          <span class="user-name">{{ userName }}</span>
          <span class="comment-time">{{ time }}</span>
        </div>
        <div class="comment-text">{{ comment }}</div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.comment-box {
  width: 100%;
  border: 1px solid #e4e7ed;
  padding: 10px;
  margin-bottom: 20px;
}

.comment-content {
  display: flex;
  align-items: flex-start;
}

.comment-body {
  flex: 1;
  margin-left: 10px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.user-name {
  font-weight: bold;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 14px;
}
</style>