<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="bg-slate-800 p-8 rounded-xl shadow-xl w-96 border border-slate-700">
      <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
      <div v-if="error" class="mb-4 p-3 bg-rose-400/10 border border-rose-700 rounded-lg text-rose-400 text-sm">{{ error }}</div>
      <form @submit.prevent="register">
        <div class="mb-4">
          <label class="block text-sm mb-1 text-slate-400">Name</label>
          <input type="text" v-model="name" class="w-full px-4 py-2 bg-slate-900 rounded-md border border-slate-700 focus:border-blue-500 outline-none transition" />
        </div>
        <div class="mb-4">
          <label class="block text-sm mb-1 text-slate-400">Email</label>
          <input type="email" v-model="email" class="w-full px-4 py-2 bg-slate-900 rounded-md border border-slate-700 focus:border-blue-500 outline-none transition" />
        </div>
        <div class="mb-4">
          <label class="block text-sm mb-1 text-slate-400">Password</label>
          <input type="password" v-model="password" class="w-full px-4 py-2 bg-slate-900 rounded-md border border-slate-700 focus:border-blue-500 outline-none transition" />
        </div>
        <div class="mb-6">
          <label class="block text-sm mb-1 text-slate-400">Confirm Password</label>
          <input type="password" v-model="confirmPassword" class="w-full px-4 py-2 bg-slate-900 rounded-md border border-slate-700 focus:border-blue-500 outline-none transition" />
        </div>
        <button type="submit" :disabled="isLoading" class="w-full py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="text-center text-sm text-slate-400 mt-6">
        Already have an account?
        <router-link to="/login" class="text-blue-400 hover:underline">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isLoading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const register = async () => {
  if (!name.value || !email.value || !password.value) {
    error.value = 'All fields are required';
    return;
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  isLoading.value = true;
  error.value = '';
  try {
    const res = await authService.register({ name: name.value, email: email.value, password: password.value });
    authStore.login(res.data.user, res.data.token);
    router.push('/dashboard');
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Registration failed';
  } finally {
    isLoading.value = false;
  }
};
</script>
