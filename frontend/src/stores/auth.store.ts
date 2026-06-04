import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '../services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = ref(!!token.value);

  const login = (userData: any, userToken: string) => {
    user.value = userData;
    token.value = userToken;
    isAuthenticated.value = true;
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
  };

  const init = async () => {
    if (token.value) {
      try {
        const res = await authService.getMe();
        user.value = res.data;
        isAuthenticated.value = true;
      } catch {
        logout();
      }
    }
  };

  return { user, token, isAuthenticated, login, logout, init };
});
