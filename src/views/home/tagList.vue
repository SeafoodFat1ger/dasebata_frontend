<template>
  <div class="card-container" @scroll="handleScroll">
    <div v-for="tag in tags" :key="tag.id" class="card" @click="navigateToTag(tag.tag)">
      <img :src="tag.image" :alt="tag.tag" class="card-image"/>
      <div class="card-content">
        <h3 class="card-title">{{ tag.tag }}</h3>
        <p class="card-followers">{{ tag.tagPersonNum }} 人关注</p>
        <!-- 圆形收藏按钮 -->
        <button
            class="favorite-btn"
            :class="{ 'focused': tag.isFocus }"
            @click.stop="toggleFavorite(tag)">
          <el-icon>
            <Star/>
          </el-icon>
        </button>
      </div>
    </div>
    <!-- 放在最下方的加载提示 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="finished" class="finished">没有更多内容了</div>
  </div>
</template>

<script>
import {get, post} from "@/net/index.js";
import {Star} from "@element-plus/icons-vue";
import {useStore} from "@/stores";
import {ElMessage} from "element-plus";

const store = useStore();
const userId = store.auth.user.id;

export default {
  name: "TopicCards",
  components: {
    Star
  },
  data() {
    return {
      tags: [{
        "id": 1,
        "tag": "使用交流",
        "image": "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png",
        "tagPersonNum": 109,
        "isFocus": false // 默认不收藏
      }], // 存储所有加载的主题数据
      currentPage: 1, // 当前加载的页码
      pageSize: 10, // 每页加载的记录数
      total: 0, // 记录总数
      loading: false, // 是否正在加载
      finished: false // 是否加载完成
    };
  },
  methods: {
    async fetchTopics() {
      if (this.loading || this.finished) return;

      this.loading = true;

      get(`/posts/getAllTags/${userId}/${this.currentPage}/${this.pageSize}`, (message, data) => {
        this.tags.push(...data.records); // 将新数据追加到现有数组
        this.total = data.postsTotal;

        // 判断是否已经加载完所有数据
        if (this.tags.length >= this.total) {
          this.finished = true;
        } else {
          this.currentPage += 1; // 更新页码
        }

        this.loading = false;
      });
    },
    handleScroll() {
      const container = this.$el; // 获取当前元素
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        this.fetchTopics(); // 触发加载更多数据
      }
    },
    navigateToTag(tagName) {
      this.$router.push(`/home/tagDetail/${tagName}`);
    },
    toggleFavorite(tag) {
      tag.isFocus = !tag.isFocus; // 切换收藏状态
      if (tag.isFocus) {
        post(`/users/focusTag`,
            {
              userId: userId,
              tag: tag.tag
            },
            (message) => {
              ElMessage.success(message)
            }
        )
      }else {
        post(`/users/cancelFocusTag`,
            {
              userId: userId,
              tag: tag.tag
            },
            (message) => {
              ElMessage.success(message)
            }
        )
      }
    }
  },
  mounted() {
    this.fetchTopics(); // 初始化加载第一页数据
  }
};
</script>

<style>
.card-container {
  padding: 60px;
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 固定为一行五列 */
  gap: 16px;
  overflow-y: auto;
  max-height: 80vh;
  position: relative;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: box-shadow 0.3s;
  position: relative;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-content {
  padding: 16px;
  position: relative;
}

.card-title {
  font-size: 18px;
  margin: 0 0 8px;
}

.card-followers {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, color 0.3s;
}

.favorite-btn:hover {
  background-color: rgba(49, 162, 232, 0.1);
  color: #409eff;
}

/* 深色背景和文字的收藏按钮 */
.favorite-btn.focused {
  background-color: #409eff; /* 深色背景 */
  color: #fff; /* 白色文字 */
}

.loading,
.finished {
  grid-column: span 5; /* 在所有卡片下面 */
  text-align: center;
  font-size: 16px;
  color: #999;
  padding: 16px;
}
</style>
