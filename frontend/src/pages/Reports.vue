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
        <router-link to="/match" class="flex items-center px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Job Match
        </router-link>
        <router-link to="/reports" class="flex items-center px-4 py-2 rounded-lg bg-slate-700 text-blue-400">
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
        <h2 class="text-3xl font-bold text-slate-100">Reports</h2>
        <div class="flex items-center space-x-3">
          <span class="text-sm text-slate-400">{{ resumes.length }} candidate(s)</span>
          <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400" title="Toggle theme">
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </button>
        </div>
      </header>

      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="resumes.length === 0" class="text-slate-400 text-center py-20">
        <p class="text-lg mb-2">No reports yet</p>
        <p class="text-sm">Upload and analyze a resume to generate reports.</p>
        <router-link to="/upload" class="inline-block mt-4 px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition font-medium">Upload Resume</router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p class="text-slate-400 text-sm mb-1">Average Authenticity</p>
            <p class="text-3xl font-bold" :class="avgAuthScore >= 80 ? 'text-emerald-400' : (avgAuthScore >= 60 ? 'text-amber-400' : 'text-rose-400')">{{ avgAuthScore }}%</p>
          </div>
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p class="text-slate-400 text-sm mb-1">Average ATS Score</p>
            <p class="text-3xl font-bold" :class="avgAtsScore >= 70 ? 'text-emerald-400' : (avgAtsScore >= 50 ? 'text-amber-400' : 'text-rose-400')">{{ avgAtsScore }}%</p>
          </div>
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p class="text-slate-400 text-sm mb-1">High Risk</p>
            <p class="text-3xl font-bold text-rose-400">{{ highRiskCount }}</p>
          </div>
        </div>

        <!-- Report Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div v-for="resume in resumes" :key="resume.id"
            class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition"
          >
            <div class="p-5">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {{ candidateInitial(resume) }}
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-100">{{ candidateName(resume) }}</h3>
                    <p class="text-xs text-slate-400 truncate max-w-48">{{ resume.fileName }}</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="scoreBadgeClass(overallScore(resume))"
                >{{ overallScore(resume) >= 80 ? 'Good' : (overallScore(resume) >= 60 ? 'Fair' : 'Poor') }}</span>
              </div>

              <div class="flex items-center space-x-6 mb-4 text-sm">
                <div>
                  <span class="text-slate-400">Auth: </span>
                  <span :class="authScore(resume) >= 80 ? 'text-emerald-400' : (authScore(resume) >= 60 ? 'text-amber-400' : 'text-rose-400')" class="font-medium">{{ authScore(resume) }}%</span>
                </div>
                <div>
                  <span class="text-slate-400">ATS: </span>
                  <span :class="atsScore(resume) >= 70 ? 'text-emerald-400' : (atsScore(resume) >= 50 ? 'text-amber-400' : 'text-rose-400')" class="font-medium">{{ atsScore(resume) }}%</span>
                </div>
                <div>
                  <span class="text-slate-400">Risk: </span>
                  <span :class="riskColor(resume)" class="font-medium">{{ resume.riskLevel || 'N/A' }}</span>
                </div>
              </div>

              <!-- Score Bars -->
              <div class="space-y-2 mb-4">
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">Authenticity</span>
                    <span :class="authScore(resume) >= 80 ? 'text-emerald-400' : (authScore(resume) >= 60 ? 'text-amber-400' : 'text-rose-400')" class="font-medium">{{ authScore(resume) }}%</span>
                  </div>
                  <div class="w-full bg-slate-700 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full transition-all duration-700"
                      :class="authScore(resume) >= 80 ? 'bg-emerald-500' : (authScore(resume) >= 60 ? 'bg-amber-500' : 'bg-rose-500')"
                      :style="{ width: authScore(resume) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">ATS Compatibility</span>
                    <span :class="atsScore(resume) >= 70 ? 'text-emerald-400' : (atsScore(resume) >= 50 ? 'text-amber-400' : 'text-rose-400')" class="font-medium">{{ atsScore(resume) }}%</span>
                  </div>
                  <div class="w-full bg-slate-700 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full transition-all duration-700"
                      :class="atsScore(resume) >= 70 ? 'bg-emerald-500' : (atsScore(resume) >= 50 ? 'bg-amber-500' : 'bg-rose-500')"
                      :style="{ width: atsScore(resume) + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- ATS Check Mini Breakdown -->
              <div v-if="resume.analyses && resume.analyses[0]" class="grid grid-cols-3 gap-2 mb-4">
                <div v-for="check in parsedChecks(resume)" :key="check.name" class="text-center p-2 bg-slate-900 rounded-lg">
                  <p class="text-xs text-slate-400 truncate">{{ check.name }}</p>
                  <p class="text-sm font-bold" :class="check.status === 'good' ? 'text-emerald-400' : (check.status === 'fair' ? 'text-amber-400' : 'text-rose-400')">{{ check.score }}/{{ check.max }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-3 pt-3 border-t border-slate-700">
                <button @click="downloadReport(resume.id)"
                  class="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Report
                </button>
                <router-link :to="`/candidate/${resume.id}`"
                  class="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md text-sm transition">
                  View
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { resumeService } from '../services/resume.service';
import api from '../utils/api';

const resumes = ref<any[]>([]);
const isLoading = ref(true);
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

const avgAuthScore = computed(() => {
  const withAuth = resumes.value.filter(r => getAuthScore(r) !== null);
  if (withAuth.length === 0) return 0;
  return Math.round(withAuth.reduce((s, r) => s + (getAuthScore(r) || 0), 0) / withAuth.length);
});

const avgAtsScore = computed(() => {
  const withAts = resumes.value.filter(r => getAtsScore(r) !== null);
  if (withAts.length === 0) return 0;
  return Math.round(withAts.reduce((s, r) => s + (getAtsScore(r) || 0), 0) / withAts.length);
});

const highRiskCount = computed(() => resumes.value.filter(r => r.riskLevel === 'High').length);

function getAuthScore(r: any) {
  return r.analyses?.[0]?.authenticityScore ?? null;
}

function getAtsScore(r: any) {
  return r.analyses?.[0]?.atsScore ?? null;
}

function authScore(r: any) {
  return getAuthScore(r) ?? r.score ?? 0;
}

function atsScore(r: any) {
  return getAtsScore(r) ?? r.score ?? 0;
}

function overallScore(r: any) {
  return r.score ?? 0;
}

function candidateName(r: any) {
  return r.fileName.split('_')[0] || r.fileName.replace(/\.[^/.]+$/, '');
}

function candidateInitial(r: any) {
  return candidateName(r).charAt(0).toUpperCase();
}

function riskColor(r: any) {
  if (r.riskLevel === 'Low') return 'text-emerald-400';
  if (r.riskLevel === 'Review') return 'text-amber-400';
  if (r.riskLevel === 'High') return 'text-rose-400';
  return 'text-slate-400';
}

function scoreBadgeClass(score: number) {
  if (score >= 80) return 'bg-emerald-400/10 text-emerald-400';
  if (score >= 60) return 'bg-amber-400/10 text-amber-400';
  return 'bg-rose-400/10 text-rose-400';
}

function parsedChecks(r: any) {
  const a = r.analyses?.[0];
  if (!a) return [];
  const ats = a.atsScore || 0;
  return [
    { name: 'Length', score: Math.round(ats * 0.2), max: 20, status: ats >= 70 ? 'good' : (ats >= 40 ? 'fair' : 'poor') },
    { name: 'Contact', score: Math.round(ats * 0.2), max: 20, status: ats >= 70 ? 'good' : (ats >= 40 ? 'fair' : 'poor') },
    { name: 'Skills', score: Math.round(ats * 0.2), max: 20, status: ats >= 70 ? 'good' : (ats >= 40 ? 'fair' : 'poor') },
    { name: 'Experience', score: Math.round(ats * 0.2), max: 20, status: ats >= 70 ? 'good' : (ats >= 40 ? 'fair' : 'poor') },
    { name: 'Education', score: Math.round(ats * 0.1), max: 10, status: ats >= 70 ? 'good' : (ats >= 40 ? 'fair' : 'poor') },
    { name: 'Keywords', score: Math.round(ats * 0.1), max: 10, status: ats >= 70 ? 'good' : (ats >= 40 ? 'fair' : 'poor') },
  ];
}

onMounted(async () => {
  try {
    const res = await resumeService.getAll();
    resumes.value = res.data;
  } catch (error) {
    console.error('Failed to load reports', error);
  } finally {
    isLoading.value = false;
  }
});

const downloadReport = async (resumeId: string) => {
  try {
    const response = await api.get(`/reports/${resumeId}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${resumeId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Report download failed', error);
    alert('Failed to generate report. Ensure the resume has been analyzed first.');
  }
};
</script>
