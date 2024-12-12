import axios from "axios";
import {ElMessage} from "element-plus";
import router from "@/router";

const defaultError = ()=>ElMessage.error('发生了一些错误，请联系管理员')
const defaultFailure = (message)=>ElMessage.warning(message)

//封装axios的post方法
function post(url, data, success, type = 'json', failure = defaultFailure, error = defaultError){
    axios.post(url, data, {
        headers:{
            'Content-Type': 'application/' + type
        },
        withCredentials: true
    }).then(({data})=>{
        if(data.code===401){
            //用户没登陆，后端会响应401
            router.push('/')
            ElMessage.warning('请重新登录')
        }
        else if(data.code == 200)
            success(data.message, data.data)
        else
            failure(data.message, data.code)
    }).catch(error)
}

//封装axios的get方法
function get(url, success, failure = defaultFailure, error = defaultError){
    axios.get(url,{
        withCredentials: true
    }).then(({data})=>{
        if(data.code===401){
            //用户没登陆，后端会响应401
            router.push('/')
            ElMessage.warning('请重新登录')
        }
        else if(data.code == 200)
            success(data.message, data.data)
        else
            failure(data.message, data.code)
    }).catch(error)
}

export {get, post}