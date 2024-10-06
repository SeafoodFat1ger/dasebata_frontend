<template>
    <el-container class="content">
        <el-header>
            <img src="../../assets/logo.jpg" alt="Cover Image" style="width: 100%; height: 200px;" />
        </el-header>

        <el-card>
            <el-avatar src="../../assets/logo.jpg" size="large"></el-avatar>
            <div>胖虎</div>
        </el-card>

        <el-menu :default-active="this.$route.path" mode="horizontal" :ellipsis="false" router>
            <el-menu-item index="/home/profile/activity">
                <span>我的动态</span>
            </el-menu-item>
            <el-menu-item index="/home/profile/likes">
                <span>我的喜欢</span>
            </el-menu-item>
            <el-menu-item index="/home/profile/guan">
                <span>我的关注</span>
            </el-menu-item>
            <el-menu-item index="/home/profile/stars">
                <span>我的收藏</span>
            </el-menu-item>
        </el-menu>

        <el-main>
            <router-view></router-view>
        </el-main>
    </el-container>
</template>
  
<script>

export default {

    data() {
        return {

            // 初始化用户数据
        };
    },
    created() {
        // 使用Axios从后端获取用户数据
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
</style>