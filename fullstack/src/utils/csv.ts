import type { PhysicalHealthData, MentalHealthData } from '@/types/health';

function toCSVRow(values: (string | number | null | undefined)[]): string {
  return values
    .map((v) => {
      if (v == null) return '';
      const s = String(v);
      // Escape quotes and wrap if needed
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    })
    .join(',');
}

function downloadCSV(filename: string, csv: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPhysicalCSV(data: PhysicalHealthData[], opts?: { filename?: string }) {
  const headers = [
    'date',
    'heartRate',
    'bloodPressureSystolic',
    'bloodPressureDiastolic',
    'weight',
    'sleepHours',
    'sleepQuality',
    'exerciseMinutes',
    'exerciseType',
    'exerciseIntensity',
    'steps',
    'waterIntake',
    'notes',
  ];
  const rows = data.map((d) => [
    new Date(d.date).toISOString(),
    d.heartRate ?? '',
    d.bloodPressureSystolic ?? '',
    d.bloodPressureDiastolic ?? '',
    d.weight ?? '',
    d.sleepHours ?? '',
    d.sleepQuality ?? '',
    d.exerciseMinutes ?? '',
    d.exerciseType ?? '',
    d.exerciseIntensity ?? '',
    d.steps ?? '',
    d.waterIntake ?? '',
    d.notes ?? '',
  ]);

  const csv = [toCSVRow(headers), ...rows.map(toCSVRow)].join('\n');
  downloadCSV(opts?.filename || 'physical-data.csv', csv);
}

export function exportMentalCSV(data: MentalHealthData[], opts?: { filename?: string }) {
  const headers = [
    'date',
    'mood',
    'stressLevel',
    'anxietyLevel',
    'energyLevel',
    'meditationMinutes',
    'journalingDone',
    'socialConnection',
    'gratitudePractice',
    'notes',
  ];
  const rows = data.map((d) => [
    new Date(d.date).toISOString(),
    d.mood ?? '',
    d.stressLevel ?? '',
    d.anxietyLevel ?? '',
    d.energyLevel ?? '',
    d.meditationMinutes ?? '',
    d.journalingDone ? 1 : 0,
    d.socialConnection ?? '',
    d.gratitudePractice ? 1 : 0,
    d.notes ?? '',
  ]);

  const csv = [toCSVRow(headers), ...rows.map(toCSVRow)].join('\n');
  downloadCSV(opts?.filename || 'mental-data.csv', csv);
}
