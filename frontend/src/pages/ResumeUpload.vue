<template>
  <div class="min-h-screen bg-slate-900 flex">
    <div class="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-8">ResumeShield AI</h1>
      <nav class="flex-1 space-y-2">
        <router-link to="/dashboard" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </router-link>
        <router-link to="/upload" class="flex items-center px-4 py-2 rounded-lg bg-slate-700 text-blue-400">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          Upload Resume
        </router-link>
        <router-link to="/match" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Job Match
        </router-link>
        <router-link to="/reports" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Reports
        </router-link>
      </nav>
      <button @click="logout" class="flex items-center w-full px-4 py-2 rounded-lg text-slate-400 hover:bg-rose-700/20 hover:text-rose-400 transition">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Logout
      </button>
    </div>
    
    <div class="flex-1 p-8">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-slate-100">Upload Resume</h2>
        <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400" title="Toggle theme">
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        </button>
      </header>
      
      <div 
        class="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
        :class="{ 'border-blue-500 bg-blue-900/10': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input type="file" ref="fileInput" class="hidden" accept=".pdf,.docx" @change="handleFileChange" />
        <div class="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p class="text-xl font-medium mb-2">Drag & Drop your resume here</p>
        <p class="text-slate-400 text-sm">Supports PDF and DOCX up to 10MB</p>
        
        <div v-if="selectedFile" class="mt-6 p-4 bg-slate-700 rounded-lg inline-block text-left animate-fade-in">
          <p class="font-medium text-blue-300">{{ selectedFile.name }}</p>
          <p class="text-xs text-slate-400">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
        </div>
      </div>
      
      <div v-if="uploadError" class="mt-4 p-4 bg-rose-400/10 border border-rose-700 rounded-lg text-rose-400 text-sm">
        {{ uploadError }}
      </div>
      
      <div class="mt-8 flex justify-end">
        <button 
          @click="upload" 
          :disabled="!selectedFile || isUploading"
          class="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium transition"
        >
          <svg v-if="isUploading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isUploading ? 'Uploading & Analyzing...' : 'Analyze Resume' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { resumeService } from '../services/resume.service';
import { analysisService } from '../services/analysis.service';

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const isDragging = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const isDark = ref(document.documentElement.getAttribute('data-theme') !== 'light');
const toggleTheme = () => {
  const next = isDark.value ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  isDark.value = !isDark.value;
};

const triggerFileInput = () => fileInput.value?.click();

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    validateAndSetFile(target.files[0]);
  }
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files.length) {
    validateAndSetFile(e.dataTransfer.files[0]);
  }
};

const validateAndSetFile = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = 'File size exceeds 10MB limit';
    return;
  }
  selectedFile.value = file;
  uploadError.value = '';
};

const uploadError = ref('');

const upload = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  uploadError.value = '';
  
  try {
    const response = await resumeService.upload(selectedFile.value);
    const resumeId = response.data.id;
    
    await analysisService.analyze(resumeId);
    
    router.push(`/candidate/${resumeId}`);
  } catch (error: any) {
    console.error('Upload failed', error);
    const msg = error.response?.data?.error || error.message || '';
    if (msg.includes('No user found')) {
      uploadError.value = 'Database not initialized. Run: cd backend && npm run db:reset';
    } else if (msg.includes('Could not parse')) {
      uploadError.value = 'Could not read file. Ensure it is a valid PDF or DOCX with extractable text.';
    } else if (msg.includes('Network Error') || msg.includes('ERR_CONNECTION_REFUSED')) {
      uploadError.value = 'Cannot connect to backend. Ensure the server is running: cd backend && npm start';
    } else {
      uploadError.value = msg || 'Upload failed. Please try again.';
    }
  } finally {
    isUploading.value = false;
  }
};
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
