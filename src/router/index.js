import {createRouter, createWebHistory} from 'vue-router'

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
                    path: 'profile',
                    name: 'profile',
                    component: () => import('../views/home/profile.vue'),
                    children: [
                        {
                            path: 'likes',
                            name: 'likes',
                            component: () => import('../views/profile/likes.vue')
                        }, {
                            path: 'stars',
                            name: 'stars',
                            component: () => import('../views/profile/stars.vue')
                        }, {
                            path: 'activity',
                            name: 'activity',
                            component: () => import('../views/profile/activity.vue')
                        }, {
                            path: 'guan',
                            name: 'guan',
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

export default router
