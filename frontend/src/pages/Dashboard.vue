<template>
  <div class="min-h-screen bg-slate-900 flex">
    <div class="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-8">ResumeShield AI</h1>
      <nav class="flex-1 space-y-2">
        <router-link to="/dashboard" class="flex items-center px-4 py-2 rounded-lg bg-slate-700 text-blue-400">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </router-link>
        <router-link to="/upload" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
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
    
    <div class="flex-1 p-8 overflow-y-auto">
      <header class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-slate-100">Dashboard Overview</h2>
        <div class="flex items-center space-x-3">
          <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400" title="Toggle theme">
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </button>
          <span class="text-slate-400">{{ user?.name || 'Recruiter' }}</span>
          <div class="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-blue-400 font-bold">
            {{ user?.name ? user.name.charAt(0).toUpperCase() : 'R' }}
          </div>
        </div>
      </header>

      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition cursor-pointer">
            <p class="text-slate-400 text-sm mb-1">Total Resumes</p>
            <p class="text-3xl font-bold text-blue-400">{{ dashboardData.totalResumes }}</p>
          </div>
          <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition cursor-pointer">
            <p class="text-slate-400 text-sm mb-1">Avg Authenticity Score</p>
            <p class="text-3xl font-bold text-emerald-400">{{ dashboardData.averageScore }}%</p>
          </div>
          <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition cursor-pointer">
            <p class="text-slate-400 text-sm mb-1">Suspected Fake</p>
            <p class="text-3xl font-bold text-rose-400">{{ dashboardData.highRiskCandidates }}</p>
          </div>
          <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition cursor-pointer">
            <p class="text-slate-400 text-sm mb-1">Avg ATS Score</p>
            <p class="text-3xl font-bold text-blue-400">{{ avgAtsScore }}%</p>
          </div>
        </div>

        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 class="text-xl font-bold mb-4">Recent Uploads</h3>
          <div v-if="dashboardData.recentUploads.length === 0" class="text-slate-400 py-4 text-center">
            No resumes uploaded yet.
          </div>
          <table v-else class="w-full text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-700">
                <th class="pb-3 font-medium">Candidate Name</th>
                <th class="pb-3 font-medium">Uploaded Date</th>
                <th class="pb-3 font-medium">Authenticity</th>
                <th class="pb-3 font-medium">ATS Score</th>
                <th class="pb-3 font-medium">Verdict</th>
                <th class="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resume in dashboardData.recentUploads" :key="resume.id" class="border-b border-slate-700/50 hover:bg-slate-750 transition">
                <td class="py-4">{{ resume.fileName.split('_')[0] }}</td>
                <td class="py-4 text-slate-400">{{ new Date(resume.createdAt).toLocaleDateString() }}</td>
                <td class="py-4">
                  <span v-if="getAuthScore(resume) !== null" :class="authScoreClass(getAuthScore(resume))" class="font-medium">
                    {{ getAuthScore(resume) }}%
                  </span>
                  <span v-else class="text-slate-500">Pending</span>
                </td>
                <td class="py-4">
                  <span v-if="getAtsScore(resume) !== null" class="font-medium" :class="atsScoreClass(getAtsScore(resume))">
                    {{ getAtsScore(resume) }}%
                  </span>
                  <span v-else class="text-slate-500">--</span>
                </td>
                <td class="py-4">
                  <span v-if="resume.riskLevel === 'Low'" class="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-xs">Genuine</span>
                  <span v-else-if="resume.riskLevel === 'Review'" class="px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full text-xs">Review</span>
                  <span v-else-if="resume.riskLevel === 'High'" class="px-3 py-1 bg-rose-400/10 text-rose-400 rounded-full text-xs">Suspected Fake</span>
                  <span v-else class="px-3 py-1 bg-slate-400/10 text-slate-400 rounded-full text-xs">N/A</span>
                </td>
                <td class="py-4">
                  <div class="flex items-center space-x-2">
                    <router-link :to="`/candidate/${resume.id}`" class="text-blue-400 hover:underline">View</router-link>
                    <button @click="confirmDelete(resume)" class="text-rose-400 hover:text-rose-300 p-1" title="Delete resume">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ConfirmModal
      :visible="deleteTarget !== null"
      title="Delete Resume"
      :message="`Delete &quot;${deleteTarget?.fileName?.split('_')[0] || 'this resume'}&quot;? This cannot be undone.`"
      confirm-text="Delete"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { analyticsService } from '../services/analytics.service';
import { authService } from '../services/auth.service';
import { resumeService } from '../services/resume.service';
import ConfirmModal from '../components/Common/ConfirmModal.vue';

const dashboardData = ref({
  totalResumes: 0,
  averageScore: 0,
  highRiskCandidates: 0,
  recentUploads: [] as any[]
});
const isLoading = ref(true);
const user = ref<any>(null);
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

const avgAtsScore = computed(() => {
  const withAts = dashboardData.value.recentUploads.filter(r => getAtsScore(r) !== null);
  if (withAts.length === 0) return 0;
  const total = withAts.reduce((sum, r) => sum + (getAtsScore(r) || 0), 0);
  return Math.round(total / withAts.length);
});

function getLastAnalysis(resume: any) {
  if (resume.analyses && resume.analyses.length > 0) {
    return resume.analyses[0];
  }
  return null;
}

function getAuthScore(resume: any) {
  const a = getLastAnalysis(resume);
  return a?.authenticityScore ?? null;
}

function getAtsScore(resume: any) {
  const a = getLastAnalysis(resume);
  return a?.atsScore ?? null;
}

function authScoreClass(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function atsScoreClass(score: number) {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-rose-400';
}

const deleting = ref(false);
const deleteTarget = ref<any>(null);

function confirmDelete(resume: any) {
  deleteTarget.value = resume;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await resumeService.delete(deleteTarget.value.id);
    dashboardData.value.recentUploads = dashboardData.value.recentUploads.filter((r: any) => r.id !== deleteTarget.value.id);
    dashboardData.value.totalResumes--;
    deleteTarget.value = null;
  } catch (error: any) {
    alert(error?.response?.data?.error || 'Failed to delete resume');
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  try {
    const [dashRes] = await Promise.all([
      analyticsService.getDashboard()
    ]);
    dashboardData.value = dashRes.data;
  } catch (error) {
    console.error('Failed to load dashboard', error);
  }
  try {
    const userRes = await authService.getMe();
    user.value = userRes.data;
  } catch {
    // Not authenticated — show dashboard without user info
  } finally {
    isLoading.value = false;
  }
});
</script>
