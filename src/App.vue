<script setup>
import {useStore} from "@/stores";
//存储用户信息的全局变量
const store = useStore()
const user = localStorage.getItem('user')
if (user != null) {
  store.auth.user = JSON.parse(user)
}
</script>

<template>
  <router-view></router-view>
</template>

<style scoped>
</style>
