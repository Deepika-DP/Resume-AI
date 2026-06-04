import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useResumeStore = defineStore('resume', () => {
  const resumes = ref<any[]>([]);
  const currentResume = ref<any>(null);
  const isUploading = ref(false);

  const setResumes = (data: any[]) => {
    resumes.value = data;
  };

  const setCurrentResume = (data: any) => {
    currentResume.value = data;
  };

  return { resumes, currentResume, isUploading, setResumes, setCurrentResume };
});
