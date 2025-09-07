export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'other';
  height: number; // in cm
  weight: number; // in kg
  goals: string[]; // Array of goal descriptions
  createdAt: Date;
}

export interface PhysicalHealthData {
  id: string;
  userId: string;
  date: Date;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  weight?: number;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5; // 1 = Poor, 5 = Excellent
  exerciseMinutes?: number;
  exerciseType?: string;
  exerciseIntensity?: 'low' | 'moderate' | 'high';
  steps?: number;
  waterIntake?: number; // in liters
  notes?: string;
}

export interface MentalHealthData {
  id: string;
  userId: string;
  date: Date;
  mood?: 1 | 2 | 3 | 4 | 5; // 1 = Very Sad, 5 = Very Happy
  stressLevel?: 1 | 2 | 3 | 4 | 5; // 1 = No Stress, 5 = Very Stressed
  anxietyLevel?: 1 | 2 | 3 | 4 | 5; // 1 = No Anxiety, 5 = Very Anxious
  energyLevel?: 1 | 2 | 3 | 4 | 5; // 1 = Very Low, 5 = Very High
  meditationMinutes?: number;
  journalingDone?: boolean;
  socialConnection?: 1 | 2 | 3 | 4 | 5; // 1 = Very Isolated, 5 = Very Connected
  gratitudePractice?: boolean;
  notes?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'physical' | 'mental' | 'both';
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  completed: boolean;
  createdAt: Date;
}

export interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}
