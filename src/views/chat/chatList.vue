<template>
  <div class="container">
    <div class="content">
      <!-- Search Bar -->
      <div class="contacts">

        <el-input
            v-model="searchQuery"
            :prefix-icon="Search"
            placeholder="搜索帖子用户"
            clearable
            @clear="clearSearch"
        >
          <template #append>
            <el-button @click="searchContacts">搜索</el-button>
          </template>
        </el-input>

        <h2 v-if="searchQuery || !isSearch">最近联系人</h2>
        <div v-for="contact in contacts" :key="contact.id" class="contact-card">
          <div @click="gotoChat(contact.id)" class="contact-info">
            <el-avatar class="avatar" :src="contact.avatar"/>
            <div class="contact-details">
              <span class="contact-name">{{ contact.username }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Box Section -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {get} from "@/net/index.js";
import {useStore} from "@/stores/index.js";
import {useRouter} from 'vue-router';
import {Search} from "@element-plus/icons-vue";

const router = useRouter();
const isSearch = ref(false);
const contacts = ref([]);
const searchQuery = ref('');
const store = useStore();
const myuser = store.auth.user;

// 获取最近联系人数据
const fetchContacts = async () => {
  get(`/chats/findRelation/${myuser.id}`, (message, data) => {
    contacts.value = data;
  });
};

// 搜索联系人
const searchContacts = async () => {
  isSearch.value = true;
  if (searchQuery.value !== '') {
    get(`/posts/find/user/${searchQuery.value}`, (message, data) => {
      contacts.value = data.records;
    });
  }else {
    contacts.value = [];
  }
};

// 清空搜索框
const clearSearch = () => {
  searchQuery.value = '';
  isSearch.value = false;
  fetchContacts();
};

// 跳转到聊天页面
const gotoChat = (id) => {
  router.push(`/home/chats/${id}`); // 路由跳转
};

onMounted(() => {
  fetchContacts(); // 组件挂载后获取联系人
});

</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 60px;
  height: 85vh;
}

.search-box {
  margin-bottom: 10px;
  width: 100%;
  max-width: 300px;
}

.search-input {
  width: 90%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 16px;
  transition: all 0.3s;
}

.search-btn,
.clear-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background-color: #409eff;
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
}

.search-btn:hover,
.clear-btn:hover {
  background-color: #3389e3;
}

.content {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 100%;
  align-items: flex-start;
}

.contacts {
  width: 100%;
  max-width: 300px;
  margin-top: 0;
  background: linear-gradient(135deg, rgba(194, 214, 246, 0.44), rgba(236, 255, 213, 0.51)); /* 渐变背景 */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  height: 100%; /* 高度占满容器 */
  overflow-y: auto; /* 启用垂直滚动 */
  padding-bottom: 10px; /* 确保有足够的底部空间来滚动 */
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.contact-card {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.contact-info {
  display: flex;
  align-items: center;
  width: 100%;
}

.contact-details {
  margin-left: 12px;
}

.contact-name {
  font-weight: 550;
  font-size: 14px;
  color: #333;
}

.contact-last-message {
  color: #777;
  font-size: 14px;
  margin-top: 4px;
}
</style>
