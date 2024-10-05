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
      component: () => import('../views/header.vue'),
      children: [
        {
          path: 'posts',
          name: 'posts',
          component: () => import('../views/home/postList.vue')
        }
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
