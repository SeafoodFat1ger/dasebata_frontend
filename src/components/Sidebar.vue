<template>
    <el-menu default-active="1" class="el-menu-vertical-demo" router :collapse="isCollapse">
        <!-- 发帖按钮 -->
        <el-menu-item index="1" @click="createPost">
            <i class="el-icon-edit"></i>
            <span>发帖</span>
        </el-menu-item>

        <!-- 分区菜单 -->
        <el-submenu index="2">
            <template #title>
                <i class="el-icon-menu"></i>
                <span>分区</span>
            </template>

            <el-menu-item index="2-1" @click="fetchPosts('study')">
                <i class="el-icon-time"></i>
                <span>学习生活</span>
            </el-menu-item>
            <el-menu-item index="2-2" @click="fetchPosts('daily')">
                <i class="el-icon-s-tools"></i>
                <span>日常事务</span>
            </el-menu-item>
            <el-menu-item index="2-3" @click="fetchPosts('emotion')">
                <i class="el-icon-heart"></i>
                <span>情感交流</span>
            </el-menu-item>
            <el-menu-item index="2-4" @click="fetchPosts('watercooler')">
                <i class="el-icon-chat-dot-square"></i>
                <span>灌水吐槽</span>
            </el-menu-item>
            <el-menu-item index="2-5" @click="fetchPosts('entertainment')">
                <i class="el-icon-headset"></i>
                <span>寻欢作乐</span>
            </el-menu-item>
        </el-submenu>
    </el-menu>
</template>
  
<script>
import axios from 'axios';

export default {
    data() {
        return {
            isCollapse: false,
        };
    },
    methods: {
        // 发帖功能
        createPost() {
            // 跳转到发帖页面或弹出发帖表单
            this.$router.push('/create-post');
        },

        // 获取不同分区的帖子
        fetchPosts(category) {
            // 调用后端 API 获取该分区的帖子
            axios.get(`/api/posts?category=${category}`)
                .then(response => {
                    // 处理获取到的帖子数据，比如存储到状态管理或渲染到页面
                    console.log(response.data);
                })
                .catch(error => {
                    console.error('Error fetching posts:', error);
                });
        }
    }
};
</script>
  
<style scoped>
.el-menu-vertical-demo {
    width: 200px;
    min-height: 100vh;
    background-color: #f8f8f8;
}

.el-menu-item {
    display: flex;
    align-items: center;
}

.el-icon {
    margin-right: 10px;
}

.el-menu-item>span {
    margin-left: 10px;
}
</style>
  