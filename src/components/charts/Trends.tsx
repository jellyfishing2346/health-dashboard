import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PhysicalHealthData, MentalHealthData } from '../../types/health';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface TrendsProps {
  physicalData: PhysicalHealthData[];
  mentalData: MentalHealthData[];
}

const toDate = (d: any) => new Date(d);

export const Trends: React.FC<TrendsProps> = ({ physicalData, mentalData }) => {
  const recentPhysical = physicalData.slice(-14);
  const recentMental = mentalData.slice(-14);

  const labelsPhysical = recentPhysical.map((d) => toDate(d.date).toLocaleDateString());
  const labelsMental = recentMental.map((d) => toDate(d.date).toLocaleDateString());

  const heartRateData = recentPhysical.map((d) => d.heartRate ?? null);
  const sleepData = recentPhysical.map((d) => d.sleepHours ?? null);

  const moodData = recentMental.map((d) => d.mood ?? null);
  const stressData = recentMental.map((d) => d.stressLevel ?? null);

  const commonOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { boxWidth: 12 } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Physical Trends */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Physical Trends</h3>
          <p className="text-sm text-gray-500">Heart rate and sleep over time</p>
        </div>
        <div className="card-content">
          {recentPhysical.length === 0 ? (
            <p className="text-gray-500">No data available yet</p>
          ) : (
            <div className="h-64">
              <Line
                data={{
                  labels: labelsPhysical,
                  datasets: [
                    {
                      label: 'Heart Rate (bpm)',
                      data: heartRateData,
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239,68,68,0.15)',
                      tension: 0.3,
                      spanGaps: true,
                    },
                    {
                      label: 'Sleep (h)',
                      data: sleepData,
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59,130,246,0.15)',
                      tension: 0.3,
                      spanGaps: true,
                    },
                  ],
                }}
                options={commonOptions}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mental Trends */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Mental Trends</h3>
          <p className="text-sm text-gray-500">Mood and stress over time</p>
        </div>
        <div className="card-content">
          {recentMental.length === 0 ? (
            <p className="text-gray-500">No data available yet</p>
          ) : (
            <div className="h-64">
              <Line
                data={{
                  labels: labelsMental,
                  datasets: [
                    {
                      label: 'Mood (/5)',
                      data: moodData,
                      borderColor: '#a855f7',
                      backgroundColor: 'rgba(168,85,247,0.15)',
                      tension: 0.3,
                      spanGaps: true,
                    },
                    {
                      label: 'Stress (/5)',
                      data: stressData,
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245,158,11,0.15)',
                      tension: 0.3,
                      spanGaps: true,
                    },
                  ],
                }}
                options={{
                  ...commonOptions,
                  scales: { ...commonOptions.scales, y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
