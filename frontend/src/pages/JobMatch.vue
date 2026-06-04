<template>
  <div class="min-h-screen bg-slate-900 flex">
    <div class="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-8">ResumeShield AI</h1>
      <nav class="flex-1 space-y-2">
        <router-link to="/dashboard" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </router-link>
        <router-link to="/upload" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          Upload Resume
        </router-link>
        <router-link to="/match" class="flex items-center px-4 py-2 rounded-lg bg-slate-700 text-blue-400">
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
        <h2 class="text-3xl font-bold text-slate-100">Match Candidate to Job</h2>
        <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400" title="Toggle theme">
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        </button>
      </header>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 relative">
            <h3 class="text-xl font-bold mb-4">Job Description</h3>
            <textarea 
              v-model="jobDescription" 
              class="w-full h-64 bg-slate-900 rounded-md border border-slate-700 p-4 focus:border-blue-500 outline-none transition text-slate-300 resize-none"
              placeholder="Paste the job description here..."
            ></textarea>
            
            <div class="mt-4">
              <label class="block text-sm text-slate-400 mb-2">Select Candidate to Match</label>
              <select v-model="selectedResume" class="w-full p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-300 focus:outline-none focus:border-blue-500">
                <option value="" disabled>Select a resume...</option>
                <option v-for="resume in resumes" :key="resume.id" :value="resume.id">{{ resume.fileName }}</option>
              </select>
            </div>

            <button 
              @click="match" 
              :disabled="!jobDescription || !selectedResume || isMatching"
              class="mt-6 w-full flex justify-center items-center py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              <svg v-if="isMatching" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isMatching ? 'Calculating...' : 'Calculate Match Score' }}
            </button>
          </div>
        </div>
        
        <div class="sticky top-8">
          <div v-if="matchResult" class="bg-slate-800 p-6 rounded-xl border border-slate-700 animate-fade-in">
            <h3 class="text-xl font-bold mb-6 text-center">Match Results</h3>
            
            <div class="flex justify-center mb-8">
              <div class="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-blue-500">
                <div class="text-center">
                  <span class="block text-5xl font-bold text-blue-400">{{ matchResult.overall }}%</span>
                  <span class="text-xs text-slate-400 uppercase tracking-wider">Overall</span>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1"><span class="text-slate-400">Skills Match</span><span class="text-emerald-400">{{ matchResult.skills }}%</span></div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" :style="{ width: matchResult.skills + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1"><span class="text-slate-400">Experience Match</span><span class="text-amber-400">{{ matchResult.experience }}%</span></div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div class="bg-amber-500 h-2 rounded-full transition-all duration-1000 ease-out" :style="{ width: matchResult.experience + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1"><span class="text-slate-400">Education Match</span><span class="text-blue-400">{{ matchResult.education }}%</span></div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out" :style="{ width: matchResult.education + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center text-slate-400">
            <p class="text-lg mb-2">No match results yet</p>
            <p class="text-sm">Enter a job description, select a candidate, and click "Calculate Match Score" to see results here.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { jobService } from '../services/job.service';
import { resumeService } from '../services/resume.service';

const jobDescription = ref('');
const resumes = ref<any[]>([]);
const selectedResume = ref('');
const matchResult = ref<any>(null);
const isMatching = ref(false);
const authStore = useAuthStore();
const router = useRouter();

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

onMounted(async () => {
  try {
    const res = await resumeService.getAll();
    resumes.value = res.data;
  } catch (error) {
    console.error('Failed to load resumes', error);
  }
});

const match = async () => {
  if (!jobDescription.value || !selectedResume.value) return;
  isMatching.value = true;
  
  try {
    const res = await jobService.match(selectedResume.value, { description: jobDescription.value });
    matchResult.value = res.data;
  } catch (error) {
    console.error('Match failed', error);
  } finally {
    isMatching.value = false;
  }
};
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
