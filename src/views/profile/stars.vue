<template>

  <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="false"/>

</template>

<script>
import PostItem from "@/components/PostItem.vue";
import {get} from "@/net/index.js";
import { onMounted, ref} from "vue";
import {useStore} from "@/stores";

const store = useStore()
export default {
  name: "star",
  components: {PostItem},
  setup() {
    const userId = store.auth.user.id;
    const posts = ref([]);
    const fetchPosts = async () => {
      get(`/bookmarks/user/${userId}`, (message, data) => {
            posts.value = data.records
          }
      )
    }
    onMounted(()=>fetchPosts())
    return {
      posts
    }
  }
}
</script>

<style scoped></style>