import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('../views/WelcomeViews.vue'),
      children: [
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
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Header.vue'),
      children: [
        {
          path: 'posts',
          name: 'posts',
          component: () => import('../views/home/postList.vue'),
        },
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
      path: '/:catchAll(.*)',
      name: '404',
      component: () => import('../views/404.vue')
    }

  ]
})

export default router
