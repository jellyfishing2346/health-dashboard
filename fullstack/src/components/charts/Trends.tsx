import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PhysicalHealthData, MentalHealthData } from '@/types/health';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface TrendsProps { physicalData: PhysicalHealthData[]; mentalData: MentalHealthData[] }
const toDate = (d: any) => new Date(d);

export const Trends: React.FC<TrendsProps> = ({ physicalData, mentalData }) => {
  const [range, setRange] = useState<'7d' | '14d' | '30d' | '90d' | 'all' | 'custom'>('14d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const openAddData = () => {
    // Dispatch a lightweight event the page listens to for opening the Add Data modal
    window.dispatchEvent(new CustomEvent('open-add-data'));
  };

  const filterByRange = <T extends { date: any }>(items: T[]) => {
    const sorted = items.slice().sort((a, b) => +toDate(a.date) - +toDate(b.date));
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    if (range === 'all') return sorted;
    if (range === 'custom' && startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + (day - 1);
      return sorted.filter(x => { const t = toDate(x.date).getTime(); return t >= start && t <= end; });
    }
    const daysMap = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 } as const;
    const selectedDays = daysMap[range as '7d' | '14d' | '30d' | '90d'] ?? 14;
    const cutoff = now - selectedDays * day;
    return sorted.filter(x => toDate(x.date).getTime() >= cutoff);
  };

  const p = filterByRange(physicalData);
  const m = filterByRange(mentalData);

  const labelsPhysical = p.map(d => toDate(d.date).toLocaleDateString());
  const labelsMental = m.map(d => toDate(d.date).toLocaleDateString());
  const heartRateData = p.map(d => d.heartRate ?? null);
  const sleepData = p.map(d => d.sleepHours ?? null);
  const moodData = m.map(d => d.mood ?? null);
  const stressData = m.map(d => d.stressLevel ?? null);

  const commonOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { boxWidth: 12 } }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { ticks: { maxRotation: 0, autoSkip: true } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2 -mb-2">
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {(['7d','14d','30d','90d','all'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-md text-sm ${range === r ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`} aria-pressed={range === r}>
              {r.toUpperCase()}
            </button>
          ))}
          <button onClick={() => setRange('custom')} className={`px-3 py-1.5 rounded-md text-sm ${range === 'custom' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`} aria-pressed={range === 'custom'}>
            Custom
          </button>
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600" htmlFor="trend-start">From</label>
              <input id="trend-start" type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-label="Trends start date" />
              <label className="text-sm text-gray-600" htmlFor="trend-end">To</label>
              <input id="trend-end" type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} aria-label="Trends end date" />
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Physical Trends</h3>
          <p className="text-sm text-gray-500">Heart rate and sleep over time</p>
        </div>
        <div className="card-content">
          {p.length === 0 ? (
            <div className="text-gray-500">
              <p>No data available for the selected range</p>
              <button onClick={openAddData} className="mt-3 text-sm font-medium text-primary-700 hover:underline">Add data</button>
            </div>
          ) : (
            <div className="h-64">
              <Line data={{ labels: labelsPhysical, datasets: [ { label: 'Heart Rate (bpm)', data: heartRateData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)', tension: 0.3, spanGaps: true }, { label: 'Sleep (h)', data: sleepData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.15)', tension: 0.3, spanGaps: true } ] }} options={commonOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Mental Trends</h3>
          <p className="text-sm text-gray-500">Mood and stress over time</p>
        </div>
        <div className="card-content">
          {m.length === 0 ? (
            <div className="text-gray-500">
              <p>No data available for the selected range</p>
              <button onClick={openAddData} className="mt-3 text-sm font-medium text-primary-700 hover:underline">Add data</button>
            </div>
          ) : (
            <div className="h-64">
              <Line data={{ labels: labelsMental, datasets: [ { label: 'Mood (/5)', data: moodData, borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', tension: 0.3, spanGaps: true }, { label: 'Stress (/5)', data: stressData, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', tension: 0.3, spanGaps: true } ] }} options={{ ...commonOptions, scales: { ...commonOptions.scales, y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } } }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
