import {createRouter, createWebHistory} from 'vue-router'
import {useStore} from "@/stores/index.js";

// 定义路由
const router = createRouter({ // 创建路由实例
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [ // 定义所有路由路径的配置，每个路径都映射到相应的组件
        { // 根路径(/) 和子路由
            path: '/',  // 根路径 /
            name: 'welcome',
            component: () => import('../views/WelcomeViews.vue'),
            children: [ // 定义子路由 在/路径下进一步匹配的路径
                {
                    path: '',
                    name: 'login',
                    component: () => import('../views/welcome/LoginPage.vue')
                }, {
                    path: 'register',
                    name: 'register',
                    component: () => import('../views/welcome/RegisterPage.vue')
                },
            ]
        },
        // 首页/home 及其子路由
        {
            path: '/home',
            name: 'home',
            component: () => import('../views/TopHeader.vue'),
            children: [
                {
                    path: 'search',
                    name: 'search',
                    component: () => import('../views/searchPage.vue'),
                },
                {
                    path: 'home',
                    name: 'homee',
                    component: () => import('../views/home/home.vue'),
                },
                {
                    path: 'chats',
                    name: 'chats',
                    component: () => import('../views/chat/chatList.vue'),
                    children:[
                        {
                            path: ':userId',
                            component: () => import('../views/chat/chatWindow.vue'),
                        }
                    ]
                },
                {
                    path: 'posts',
                    name: 'posts',
                    component: () => import('../views/home/postList.vue'),
                },
                {
                    path: 'tags',
                    name: 'tags',
                    component: () => import('../views/home/tagList.vue'),
                },
                // 新增帖子详情(postDetail)
                // {
                //   path: 'postDetail/:id',
                //   name: 'PostDetail',
                //   component: () => import('../views/home/postDetail.vue')
                // },
                {
                    path: 'profile/:userId',
                    name: 'profile',
                    component: () => import('../views/home/profile.vue'),
                    children: [
                        {
                            path: 'likes',
                            name: 'likes',
                            props: true,
                            component: () => import('../views/profile/likes.vue')
                        }, {
                            path: 'stars',
                            name: 'stars',
                            props: true,
                            component: () => import('../views/profile/stars.vue')
                        }, {
                            path: 'activity',
                            name: 'activity',
                            component: () => import('../views/profile/activity.vue'),
                            props: true
                        }, {
                            path: 'guan',
                            name: 'guan',
                            props: true,
                            component: () => import('../views/profile/guan.vue')
                        }
                    ]
                },
            ]
        },
        {
            path: '/:catchAll(.*)', // 匹配所有未定义路径
            name: '404',
            component: () => import('../views/404.vue')
        },
        {
            path: '/home/postDetail/:id',
            name: 'PostDetail',
            component: () => import('../views/home/postDetail.vue')
        },
        {
            path: '/home/tagDetail/:tagStr',
            name: 'TagDetail',
            component: () => import('../views/home/tagDetail.vue')
        },
    ]
})

// 设置路由守卫
router.beforeEach((to, from, next) => {
    const store = useStore(); // 获取store
    const user = store.auth.user || JSON.parse(localStorage.getItem('user')); // 从store或localStorage获取用户信息

    // 检查用户是否已登录
    if (!user && to.name !== 'login' && to.name !== 'register') {
        // 如果用户未登录，且试图访问需要登录的页面，重定向到登录页面
        next({ name: 'login' });
    } else {
        // 如果用户已登录或访问的是不需要登录的页面，继续访问
        next();
    }
});

export default router
