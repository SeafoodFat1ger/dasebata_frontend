<template>
  <div>
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
    <!-- 其他内容 -->
  </div>
</template>

<script>

export default {
  data() {
    return {
      post: [
        {
          p_id: 5,
          title: "这是帖子标题",
          author: {
              avatar: "https://example.com/avatar5.png",
              name: "这是楼主的name",
          },
          publishDate: "2099-09-20 22:54",
          summary: "这是帖子summary",
          tags: ["tag1", "tag2"],
          comments: [
            {
              cmtId: 1,
              cmtContent: "这是评论1",
              cmtPublishDate: "2099-09-20 23:13",
              cmtAuthor: {
                avatar: "https://example.com/avatar1.png",
                name: "Alice",
              },
            }
          ],
        },
      ], // 存储帖子详情数据
    };
  },
  created() {
    const postId = this.$route.params.id; // // 从路由参数中获取帖子 ID
    //this.fetchPostDetails(postId); // 调用获取帖子详情
  },
  methods: {
    async fetchPostDetails(id) {
      try { // 从后台 API 获取帖子数据
        const response = await axios.get(`/api/posts/${id}`);
        this.post = response.data;
      } catch (error) {
        console.error("获取帖子详情失败：", error); // 处理错误，如显示错误信息
      }
    },
  },
};
</script>
