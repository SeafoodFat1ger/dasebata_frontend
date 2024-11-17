<template>
  <div class="container">
    <!-- Search Bar -->


    <div class="content">
      <!-- Recent Contacts Section -->
      <div class="contacts">
        <h2>最近联系人</h2>
        <div v-for="contact in filteredContacts" :key="contact.name" class="contact-card">
          <div class="contact-info">
            <span class="contact-name">{{ contact.name }}</span>
            <span class="contact-last-message">{{ contact.lastMessage }}</span>
          </div>
        </div>
      </div>

      <!-- Message Box Section (You can add the message box here) -->
      <div class="message-box">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const contacts = ref([
  { name: '技术研究所', lastMessage: '亲爱的，胖虎我们有接单需求' },
  { name: '知乎学堂', lastMessage: '亲爱的，胖虎你好吗，本期课程' },
  { name: 'AI技术研究所', lastMessage: '亲爱的，胖虎，你也太幸运了' },
  { name: '知乎电影', lastMessage: '《白日之下》是香港电影大展' },
  { name: '创作者小助手', lastMessage: '「好运接龙挑战赛」激动人心' },
  { name: '知乎实验室', lastMessage: '亲爱的胖虎，你好，这是我' },
  { name: '考研学习社', lastMessage: '最近想考研吗？' },
  { name: '知乎游戏', lastMessage: '亲爱的胖虎，你好！' },
]);

const searchQuery = ref('');

// Filter contacts based on the search query
const filteredContacts = computed(() => {
  return contacts.value.filter(contact =>
      contact.name.includes(searchQuery.value)
  );
});
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.search-box {
  margin-bottom: 10px;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.content {
  display: flex;
  gap: 20px;
  width: 100%;
}

.contacts {
  width: 300px;
  margin-top: 60px;
}

.contact-card {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.contact-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-name {
  font-weight: bold;
}

.contact-last-message {
  color: #777;
}

.message-box {
  flex-grow: 1;
}
</style>
