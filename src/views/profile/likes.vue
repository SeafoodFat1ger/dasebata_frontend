<template>

  <PostItem v-for="post in posts" :key="post.postId" :post="post" :needTag="false"/>

</template>

<script>
import PostItem from "@/components/PostItem.vue";
import {get} from "@/net/index.js";
import { onMounted, ref} from "vue";

export default {
  components: {PostItem},
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const posts = ref([]);
    const fetchPosts = async () => {
      get(`/likes/user/${props.userId}`, (message, data) => {
            posts.value = data
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