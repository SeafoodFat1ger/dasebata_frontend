import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from "axios";
import { createPinia } from "pinia";
import './assets/icon/iconfont.css'

const app = createApp(App)
//配置服务器地址（后端）前缀
axios.defaults.baseURL = 'http://47.93.187.154:8082'

app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
