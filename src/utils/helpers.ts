import type { PhysicalHealthData, MentalHealthData, HealthMetric } from '../types/health';
import { format, subDays, isAfter, parseISO } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MM/dd');
};

export const getRecentData = <T extends { date: Date | string }>(
  data: T[],
  days: number = 7
): T[] => {
  const cutoffDate = subDays(new Date(), days);
  return data.filter(item => {
    const itemDate = typeof item.date === 'string' ? parseISO(item.date) : item.date;
    return isAfter(itemDate, cutoffDate);
  });
};

export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateAverageMetric = (
  data: (PhysicalHealthData | MentalHealthData)[],
  metric: string,
  days: number = 7
): number => {
  const recentData = getRecentData(data, days);
  const values = recentData
    .map(item => (item as any)[metric])
    .filter(value => value !== undefined && value !== null);
  
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
};

export const getTrend = (
  data: (PhysicalHealthData | MentalHealthData)[],
  metric: string,
  days: number = 7
): 'up' | 'down' | 'stable' => {
  const recentData = getRecentData(data, days).sort((a, b) => {
    const dateA = typeof a.date === 'string' ? parseISO(a.date) : a.date;
    const dateB = typeof b.date === 'string' ? parseISO(b.date) : b.date;
    return dateA.getTime() - dateB.getTime();
  });

  if (recentData.length < 2) return 'stable';

  const values = recentData
    .map(item => (item as any)[metric])
    .filter(value => value !== undefined && value !== null);

  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.ceil(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const difference = Math.abs(secondAvg - firstAvg);
  const threshold = firstAvg * 0.05; // 5% threshold

  if (difference < threshold) return 'stable';
  return secondAvg > firstAvg ? 'up' : 'down';
};

export const generateHealthMetrics = (
  physicalData: PhysicalHealthData[],
  mentalData: MentalHealthData[]
): HealthMetric[] => {
  return [
    {
      label: 'Average Heart Rate',
      value: calculateAverageMetric(physicalData, 'heartRate'),
      unit: 'bpm',
      trend: getTrend(physicalData, 'heartRate'),
      color: 'physical-500',
    },
    {
      label: 'Sleep Quality',
      value: calculateAverageMetric(physicalData, 'sleepQuality'),
      unit: '/5',
      trend: getTrend(physicalData, 'sleepQuality'),
      color: 'primary-500',
    },
    {
      label: 'Daily Steps',
      value: calculateAverageMetric(physicalData, 'steps'),
      unit: 'steps',
      trend: getTrend(physicalData, 'steps'),
      color: 'green-500',
    },
    {
      label: 'Mood Score',
      value: calculateAverageMetric(mentalData, 'mood'),
      unit: '/5',
      trend: getTrend(mentalData, 'mood'),
      color: 'mental-500',
    },
    {
      label: 'Stress Level',
      value: calculateAverageMetric(mentalData, 'stressLevel'),
      unit: '/5',
      trend: getTrend(mentalData, 'stressLevel'),
      color: 'orange-500',
    },
    {
      label: 'Energy Level',
      value: calculateAverageMetric(mentalData, 'energyLevel'),
      unit: '/5',
      trend: getTrend(mentalData, 'energyLevel'),
      color: 'blue-500',
    },
  ];
};

export const getMoodEmoji = (mood: number): string => {
  switch (mood) {
    case 1: return '😢';
    case 2: return '😕';
    case 3: return '😐';
    case 4: return '😊';
    case 5: return '😄';
    default: return '😐';
  }
};

export const getStressColor = (stress: number): string => {
  if (stress <= 2) return 'text-green-600';
  if (stress <= 3) return 'text-yellow-600';
  return 'text-red-600';
};
