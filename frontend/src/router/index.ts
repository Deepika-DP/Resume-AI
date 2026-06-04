import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/register', component: () => import('../pages/Register.vue') },
  { path: '/dashboard', component: () => import('../pages/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/upload', component: () => import('../pages/ResumeUpload.vue'), meta: { requiresAuth: true } },
  { path: '/match', component: () => import('../pages/JobMatch.vue'), meta: { requiresAuth: true } },
  { path: '/candidate/:id', component: () => import('../pages/CandidateDetail.vue'), meta: { requiresAuth: true } },
  { path: '/reports', component: () => import('../pages/Reports.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: () => import('../pages/NotFound.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const publicRoutes = ['/login', '/register'];

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }
  if (publicRoutes.includes(to.path) && authStore.isAuthenticated) {
    return '/dashboard';
  }
});

export default router;
