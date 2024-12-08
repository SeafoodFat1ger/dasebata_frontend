<template>
  <div class="card-container" @scroll="handleScroll">
    <div v-for="tag in tags" :key="tag.id" class="card" @click="navigateToTag(tag.tag)">
      <img :src="tag.url" :alt="tag.tag" class="card-image"/>
      <div class="card-content">
        <p class="card-followers">{{ tag.tagPersonNum }} 人关注</p>
        <h3 class="card-title">{{ tag.tag }}</h3>
        <!-- 圆形收藏按钮 -->
        <button
            class="favorite-btn"
            :class="{ 'focused': tag.isFocus }"
            @click.stop="toggleFavorite(tag)">
          <span class="icon">⭐️</span>
        </button>
      </div>
    </div>
    <!-- 放在最下方的加载提示 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="finished" class="finished">没有更多内容了</div>
  </div>
</template>

<script>
import { get, post } from "@/net/index.js";
import { Star } from "@element-plus/icons-vue";
import { useStore } from "@/stores";
import { ElMessage } from "element-plus";

const store = useStore();
const userId = store.auth.user.id;

export default {
  name: "TopicCards",
  components: {
    Star
  },
  data() {
    return {
      tags: [], // 存储所有加载的主题数据
      currentPage: 1, // 当前加载的页码
      pageSize: 30, // 每页加载的记录数
      total: 0, // 记录总数
      loading: false, // 是否正在加载
      finished: false // 是否加载完成
    };
  },
  methods: {
    // 获取数据方法
    async fetchTopics() {
      if (this.loading || this.finished) return;
      this.loading = true;
      get(`/posts/getAllTags/${userId}/${this.currentPage}/${this.pageSize}`, (message, data) => {
        this.tags.push(...data.records); // 将新数据追加到现有数组
        this.total = data.total;
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

    // 跳转到标签详情页
    navigateToTag(tagName) {
      this.$router.push(`/home/tagDetail/${tagName}`);
    },

    // 切换收藏状态
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
              tag.tagPersonNum++;
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
              tag.tagPersonNum--;
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

<style scoped>
.card-container {
  padding-top: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  overflow-y: auto;
  max-height: 80vh;
}

.card {
  background-color: rgba(229, 227, 227, 0.38);
  width: 250px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.card-content {
  padding: 10px;
  display: flex;
  justify-content: space-between;  /* 文字和按钮分开，左边文字，右边按钮 */
  align-items: center;  /* 垂直居中对齐 */
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  margin-right: 15px;
}

.card-followers {
  font-size: 0.9rem;
  color: #888;
}

.favorite-btn {
  background-color: transparent;
  border: 2px solid rgba(79, 64, 17, 0.58);
  font-size: 1.5rem;
  color: #ffcc00;
  cursor: pointer;
  transition: color 0.3s ease;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:focus {
  outline: none;
}

.favorite-btn.focused {
  background-color: #ffaf5f;
  color: #4f4011;
  border-color: #735400;
}

.favorite-btn .icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.favorite-btn:hover .icon {
  transform: scale(1.2);
}

.loading, .finished {
  text-align: center;
  width: 100%;
  font-size: 1.2rem;
  color: #888;
  margin-top: 20px;
}

.loading {
  color: #888;
}

.finished {
  color: #888;
}

</style>
