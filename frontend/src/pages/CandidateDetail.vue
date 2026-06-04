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
        <h2 class="text-3xl font-bold text-slate-100">Candidate Detail</h2>
        <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400" title="Toggle theme">
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        </button>
      </header>
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="resume">
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/dashboard" class="text-blue-400 hover:underline flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </router-link>
            <h2 class="text-3xl font-bold text-slate-100">Candidate Details</h2>
          </div>
          <router-link to="/match" class="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition font-medium">Match to Job</router-link>
        </div>

        <!-- Summary Card -->
        <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <div class="flex items-center space-x-4 mb-4">
            <div class="h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-blue-400">
              {{ (resume.fileName.split('_')[0] || 'U').charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-xl font-bold">{{ resume.fileName.split('_')[0] || 'Unknown' }}</h3>
              <p class="text-slate-400 truncate">{{ resume.fileName }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4 pt-4 border-t border-slate-700">
            <div class="flex items-center space-x-2">
              <span class="text-slate-400 text-sm">Overall:</span>
              <span class="text-2xl font-bold" :class="overallScore >= 70 ? 'text-emerald-400' : (overallScore >= 50 ? 'text-amber-400' : 'text-rose-400')">{{ overallScore }}%</span>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium" :class="riskBadgeClass">{{ riskLabel }}</span>
          </div>
        </div>

        <!-- Two-Column Layout: Authenticity (Left) | ATS Score (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- LEFT: Authenticity / Fake Detection -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold flex items-center">
                <span class="text-amber-400 mr-2">&#9888;</span>
                Authenticity Check
              </h3>
              <span v-if="analysis" class="text-sm font-bold" :class="authenticityScore >= 80 ? 'text-emerald-400' : (authenticityScore >= 60 ? 'text-amber-400' : 'text-rose-400')">
                {{ authenticityScore }}/100
              </span>
            </div>

            <div v-if="!analysis" class="text-slate-400 text-center py-4">No analysis data available. Upload and analyze first.</div>

            <div v-else class="space-y-3">
              <div v-for="(flag, idx) in fakeFlags" :key="idx"
                class="p-4 rounded-lg border"
                :class="{
                  'bg-rose-900/20 border-rose-700': flag.severity === 'high',
                  'bg-amber-900/20 border-amber-700': flag.severity === 'medium',
                  'bg-slate-900 border-slate-700': flag.severity === 'low' || flag.severity === 'none'
                }"
              >
                <div class="flex items-start">
                  <span class="mr-2 mt-0.5 text-lg" :class="{
                    'text-rose-400': flag.severity === 'high',
                    'text-amber-400': flag.severity === 'medium',
                    'text-emerald-400': flag.severity === 'none',
                    'text-blue-400': flag.severity === 'low'
                  }">
                    {{ flag.severity === 'high' ? '&#9888;' : (flag.severity === 'none' ? '&#10003;' : '&#9888;') }}
                  </span>
                  <div>
                    <h4 class="font-bold text-sm" :class="{
                      'text-rose-300': flag.severity === 'high',
                      'text-amber-300': flag.severity === 'medium',
                      'text-emerald-300': flag.severity === 'none',
                      'text-slate-300': flag.severity === 'low'
                    }">{{ flag.label }}</h4>
                    <p class="text-slate-400 text-sm mt-1">{{ flag.text }}</p>
                    <span class="inline-block mt-2 text-xs px-2 py-0.5 rounded" :class="{
                      'bg-rose-400/10 text-rose-400': flag.severity === 'high',
                      'bg-amber-400/10 text-amber-400': flag.severity === 'medium',
                      'bg-emerald-400/10 text-emerald-400': flag.severity === 'none',
                      'bg-blue-400/10 text-blue-400': flag.severity === 'low'
                    }">{{ flag.detail }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="analysis && authenticityScore >= 80" class="mt-4 p-3 bg-emerald-400/10 border border-emerald-700 rounded-lg">
              <p class="text-emerald-400 text-sm font-medium">This resume appears to be authentic human-written content.</p>
            </div>
            <div v-else-if="analysis && authenticityScore < 60" class="mt-4 p-3 bg-rose-400/10 border border-rose-700 rounded-lg">
              <p class="text-rose-400 text-sm font-medium">This resume shows strong signs of being AI-generated or inflated. Proceed with caution.</p>
            </div>
          </div>

          <!-- RIGHT: ATS Score -->
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold flex items-center">
                <span class="text-blue-400 mr-2">&#9776;</span>
                ATS Resume Score
              </h3>
              <span v-if="analysis" class="text-3xl font-bold" :class="atsScore >= 70 ? 'text-emerald-400' : (atsScore >= 50 ? 'text-amber-400' : 'text-rose-400')">{{ atsScore }}</span>
            </div>

            <div v-if="!analysis" class="text-slate-400 text-center py-4">No analysis data available.</div>

            <div v-else class="space-y-3">
              <div v-for="(check, idx) in atsChecks" :key="idx">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-400">{{ check.name }}</span>
                  <div>
                    <span :class="{
                      'text-emerald-400': check.status === 'good',
                      'text-amber-400': check.status === 'fair',
                      'text-rose-400': check.status === 'poor'
                    }">{{ check.score }}/{{ check.max }}</span>
                  </div>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-700 ease-out" :class="{
                    'bg-emerald-500': check.status === 'good',
                    'bg-amber-500': check.status === 'fair',
                    'bg-rose-500': check.status === 'poor'
                  }" :style="{ width: (check.score / check.max * 100) + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div v-if="recommendations.length > 0" class="mt-6">
              <h4 class="font-bold text-sm text-blue-400 mb-3">Recommendations to Improve ATS Score</h4>
              <ul class="space-y-2">
                <li v-for="(rec, idx) in recommendations" :key="idx" class="flex items-start text-sm">
                  <span class="text-blue-400 mr-2 flex-shrink-0">&#9654;</span>
                  <span class="text-slate-300">{{ rec }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- All Findings -->
        <div v-if="analysis && findings.length > 0" class="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 class="text-xl font-bold mb-4">All Analysis Details</h3>
          <ul class="space-y-3">
            <li v-for="(finding, idx) in findings" :key="idx" class="flex items-start p-3 bg-slate-900 rounded-lg border border-slate-700">
              <span class="mr-2 flex-shrink-0" :class="{
                'text-emerald-400': finding.type === 'Success',
                'text-amber-400': finding.type === 'Warning',
                'text-blue-400': finding.type === 'Info'
              }">
                {{ finding.type === 'Success' ? '&#10003;' : (finding.type === 'Warning' ? '&#9888;' : '&#8505;') }}
              </span>
              <div>
                <p class="text-slate-300 text-sm">{{ finding.text }}</p>
                <span v-if="finding.detail" class="text-xs text-slate-500">{{ finding.detail }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="text-center text-slate-400 mt-20">
        Candidate not found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { resumeService } from '../services/resume.service';
import { analysisService } from '../services/analysis.service';

const route = useRoute();
const resume = ref<any>(null);
const analysis = ref<any>(null);
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

const overallScore = computed(() => resume.value?.score ?? 0);
const authenticityScore = computed(() => analysis.value?.authenticityScore ?? resume.value?.score ?? 0);
const atsScore = computed(() => analysis.value?.atsScore ?? 0);
const fakeFlags = computed(() => analysis.value?.fakeFlags ?? []);
const atsChecks = computed(() => analysis.value?.atsChecks ?? []);
const findings = computed(() => (analysis.value?.findings ?? []).filter((f: any) => f.text));
const recommendations = computed(() => analysis.value?.recommendations ?? []);
const riskLabel = computed(() => {
  const rl = resume.value?.riskLevel;
  if (rl === 'Low') return 'Genuine Resume';
  if (rl === 'Review') return 'Needs Review';
  if (rl === 'High') return 'Suspected Fake';
  return 'Not Analyzed';
});
const riskBadgeClass = computed(() => {
  const rl = resume.value?.riskLevel;
  if (rl === 'Low') return 'bg-emerald-400/10 text-emerald-400';
  if (rl === 'Review') return 'bg-amber-400/10 text-amber-400';
  if (rl === 'High') return 'bg-rose-400/10 text-rose-400';
  return 'bg-slate-400/10 text-slate-400';
});

onMounted(async () => {
  try {
    const res = await resumeService.getById(route.params.id as string);
    resume.value = res.data;

    try {
      const analysisRes = await analysisService.getByResumeId(route.params.id as string);
      analysis.value = analysisRes.data;
    } catch {
      console.warn('No analysis found for this resume');
    }
  } catch (error) {
    console.error('Failed to load candidate', error);
  } finally {
    isLoading.value = false;
  }
});
</script>
