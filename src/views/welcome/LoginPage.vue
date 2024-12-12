<template>
  <div style="text-align: center;margin: 0 20px">
    <div style="margin-top: 200px">
      <div style="font-size: 25px;font-weight: bold">登录</div>
      <div style="font-size: 14px;color:grey">输入用户名和密码进行登录</div>
    </div>
    <div style="margin-top: 50px">
      <el-input v-model="form.username" type="text" placeholder="用户名">
        <template #prefix>
          <el-icon>
            <User />
          </el-icon>
        </template>
      </el-input>
      <el-input v-model="form.password" type="password" style="margin-top: 20px" placeholder="密码">
        <template #prefix>
          <el-icon>
            <Lock />
          </el-icon>
        </template>
      </el-input>
    </div>

    <div style="margin-top: 40px">
      <el-button @click="login()" style="width: 270px" type="success" plain>登录</el-button>
    </div>
    <el-divider>
      <span style="color: grey;font-size: 13px">没有账号</span>
    </el-divider>
    <div>
      <el-button @click="router.push('/register')" style="width: 270px" type="warning" plain>注册账号</el-button>
    </div>
  </div>
</template>

<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import router from "@/router";
import { post, get } from "@/net/index";
import { useStore } from "@/stores";

const store = useStore()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const login = () => {
  if (!form.username || !form.password) {
    ElMessage.warning("请填写用户名和密码")
  } else {
    post('/users/login', {
      username: form.username,
      password: form.password,
    }, (message, data) => {//登录成功
      //先获取用户信息
      get(`/users/get/${data}`, (getMessage, getData) => {
        //用户信息存储在前端
        store.auth.user = getData
        localStorage.setItem("user", JSON.stringify(getData))//存在localStorage永久存储
        ElMessage.success(message)
        router.push('/home/home')
      }, () => {
        store.auth.user = null
      })
    })
  }
}
</script>

<style scoped></style>