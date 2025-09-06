import type { UserProfile, PhysicalHealthData, MentalHealthData, Goal } from '../types/health';

const STORAGE_KEYS = {
  USER_PROFILE: 'health-dashboard-user-profile',
  PHYSICAL_DATA: 'health-dashboard-physical-data',
  MENTAL_DATA: 'health-dashboard-mental-data',
  GOALS: 'health-dashboard-goals',
};

export const storage = {
  // User Profile
  getUserProfile: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return null;
    
    const profile = JSON.parse(data);
    // Migration: ensure goals property exists
    if (!profile.goals) {
      profile.goals = [];
    }
    return profile;
  },

  saveUserProfile: (profile: UserProfile): void => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Physical Health Data
  getPhysicalHealthData: (): PhysicalHealthData[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PHYSICAL_DATA);
    return data ? JSON.parse(data) : [];
  },

  savePhysicalHealthData: (data: PhysicalHealthData[]): void => {
    localStorage.setItem(STORAGE_KEYS.PHYSICAL_DATA, JSON.stringify(data));
  },

  addPhysicalHealthEntry: (entry: PhysicalHealthData): void => {
    const existingData = storage.getPhysicalHealthData();
    existingData.push(entry);
    storage.savePhysicalHealthData(existingData);
  },

  // Mental Health Data
  getMentalHealthData: (): MentalHealthData[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MENTAL_DATA);
    return data ? JSON.parse(data) : [];
  },

  saveMentalHealthData: (data: MentalHealthData[]): void => {
    localStorage.setItem(STORAGE_KEYS.MENTAL_DATA, JSON.stringify(data));
  },

  addMentalHealthEntry: (entry: MentalHealthData): void => {
    const existingData = storage.getMentalHealthData();
    existingData.push(entry);
    storage.saveMentalHealthData(existingData);
  },

  // Goals
  getGoals: (): Goal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  },

  saveGoals: (goals: Goal[]): void => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  addGoal: (goal: Goal): void => {
    const existingGoals = storage.getGoals();
    existingGoals.push(goal);
    storage.saveGoals(existingGoals);
  },

  updateGoal: (updatedGoal: Goal): void => {
    const goals = storage.getGoals();
    const index = goals.findIndex(g => g.id === updatedGoal.id);
    if (index !== -1) {
      goals[index] = updatedGoal;
      storage.saveGoals(goals);
    }
  },

  deleteGoal: (goalId: string): void => {
    const goals = storage.getGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    storage.saveGoals(filteredGoals);
  },
};
