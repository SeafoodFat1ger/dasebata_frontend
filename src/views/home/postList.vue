<template>
    <el-container class="content">
        <!-- 左侧菜单 -->
        <el-aside width="200px">
            <el-button type="primary" style="margin-left: 16px" @click="drawer = true">
                发起帖子 {{ drawer }}
            </el-button>
            <el-menu>
                <el-menu-item>全部</el-menu-item>
                <el-menu-item>学习生活</el-menu-item>
                <el-menu-item>日常事务</el-menu-item>
                <el-menu-item>情感交流</el-menu-item>
                <el-menu-item>潜水吐槽</el-menu-item>
                <el-menu-item>寻找作乐</el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <div>
              <PostItem v-for="post in paginatedPosts" :key="post.id" :post="post" />
            </div>
            <!-- 分页组件 -->
            <el-pagination background layout="prev, pager, next" :total="posts.length" :page-size="pageSize"
                v-model:currentPage="currentPage" @current-change="handlePageChange" class="pagination" />
        </el-main>
    </el-container>

    <!--rich text-->
    <el-drawer v-model="drawer" size="80%" direction="btt" title="发布帖子">
        <myEditor/>
    </el-drawer>
</template>

<script>
import { ElAvatar, ElTag, ElIcon, ElPagination } from 'element-plus'
import { ChatLineSquare } from "@element-plus/icons-vue";
import myEditor from "../../components/Editor.vue" 
import router from "@/router";

import { ref } from 'vue'
import PostItem from "@/components/PostItem.vue";
const drawer = ref(false)
const pageSize = 10;

export default {
    components: {
      PostItem,
        myEditor,
        ElAvatar,
        ElTag,
        ElIcon,
        ElPagination,
        ChatLineSquare
    },
    data() {
        return {
            drawer,
            showPostDialog: true,
            posts: [
                {
                    id: 1,
                    title: "大二鼠鼠的日记楼",
                    author: {
                        avatar: "https://example.com/avatar1.png",
                        name: "楼主"
                    },
                    publishDate: "2024-08-24 18:52",
                    summary: "新学期快开始了，开一个日记楼，先睡会吧。",
                    tags: ["学习生活", "日常事务"],
                    commentsCount: 28
                },
                {
                    id: 2,
                    title: "大三鼠鼠求实验室建议",
                    author: {
                        avatar: "https://example.com/avatar2.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-19 23:41",
                    summary: "大三，保研边缘徘徊，实验室的建议是什么？",
                    tags: ["科研", "实验室"],
                    commentsCount: 9
                },
                {
                    id: 3,
                    title: "科研经历在保研中的占比",
                    author: {
                        avatar: "https://example.com/avatar3.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-20 22:13",
                    summary: "现在大三，感觉科研对保研的帮助有多大？",
                    tags: ["保研", "科研"],
                    commentsCount: 5
                },
                {
                    id: 4,
                    title: "2021级你推免分数线预测/结果",
                    author: {
                        avatar: "https://example.com/avatar4.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-09 14:44",
                    summary: "听说今年政策有变动，推免分数线会涨吗？",
                    tags: ["推免", "政策"],
                    commentsCount: 24
                },
                {
                    id: 5,
                    title: "卓工",
                    author: {
                        avatar: "https://example.com/avatar5.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-20 22:54",
                    summary: "有经验的同学，卓工的优势在哪？",
                    tags: ["卓工", "考研"],
                    commentsCount: 0
                },
                // 添加更多的模拟帖子...
                {
                    id: 5,
                    title: "卓工",
                    author: {
                        avatar: "https://example.com/avatar5.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-20 22:54",
                    summary: "有经验的同学，卓工的优势在哪？",
                    tags: ["卓工", "考研"],
                    commentsCount: 0
                },
                {
                    id: 5,
                    title: "卓工",
                    author: {
                        avatar: "https://example.com/avatar5.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-20 22:54",
                    summary: "有经验的同学，卓工的优势在哪？",
                    tags: ["卓工", "考研"],
                    commentsCount: 0
                },
                {
                    id: 5,
                    title: "卓工",
                    author: {
                        avatar: "https://example.com/avatar5.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-20 22:54",
                    summary: "有经验的同学，卓工的优势在哪？",
                    tags: ["卓工", "考研"],
                    commentsCount: 0
                },
                {
                    id: 5,
                    title: "卓工",
                    author: {
                        avatar: "https://example.com/avatar5.png",
                        name: "楼主"
                    },
                    publishDate: "2024-09-20 22:54",
                    summary: "有经验的同学，卓工的优势在哪？",
                    tags: ["卓工", "考研"],
                    commentsCount: 0
                },

            ],
            currentPage: 1,
        };
    },
    computed: {
        // 根据当前页码计算展示的帖子
        paginatedPosts() {
            const start = (this.currentPage - 1) * pageSize;
            const end = start + pageSize;
            return this.posts.slice(start, end);
        }
    },
    // mounted() {
    //     this.fetchPosts();
    // },
    methods: {
        // handleClose(done) {
        //     this.showPostDialog = false;
        //     done();
        // },
        // 页码改变时触发
        handlePageChange(page) {
            this.currentPage = page;
        },
        fetchPosts() {
            // 向后端 API 请求数据，示例使用 Axios
            this.$axios.get('/api/posts')
                .then(response => {
                    this.posts = response.data;
                })
                .catch(error => {
                    console.error("Error fetching posts", error);
                });
        },

        // 鼠标悬停改变背景颜色
        onMouseEnter(event) {
            event.currentTarget.style.backgroundColor = '#f5f5f5';
        },
        onMouseLeave(event) {
            event.currentTarget.style.backgroundColor = '';
        },
        goToPost(id) {
            router.push(`/home/postDetail/${id}`); // 动态路由参数跳转到对应的 postDetail 页面
        }
    }
};
</script>
  
<style scoped>
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    /* 确保头部处于页面最前 */
}

.content {
    padding-top: 60px;
    /* 根据myHead组件的高度调整padding */
}


.sidebar {
    width: 200px;
    /* 设置 sidebar 的宽度 */
    margin-right: 20px;
    /* 添加右侧间距 */
}

.post-footer .el-icon {
    margin-right: 5px;
}

.pagination {
    margin-top: 20px;
    text-align: center;
}
</style>
  