import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import type { MentalHealthData } from '../../types/health';

interface MentalSectionProps {
  data: MentalHealthData[];
}

export const MentalSection: React.FC<MentalSectionProps> = ({ data }) => {
  const [range, setRange] = useState<'7d' | '14d' | '30d' | '90d' | 'all' | 'custom'>('14d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fMood, setFMood] = useState(false);
  const [fStress, setFStress] = useState(false);
  const [fMeditation, setFMeditation] = useState(false);

  const toDate = (d: any) => new Date(d);
  const formatDate = (d: any) => toDate(d).toLocaleDateString();

  const filterByRange = (items: MentalHealthData[]) => {
    const sorted = items.slice().sort((a, b) => +toDate(a.date) - +toDate(b.date));
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    if (range === 'all') return sorted;

    if (range === 'custom' && startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + (day - 1);
      return sorted.filter((x) => {
        const t = toDate(x.date).getTime();
        return t >= start && t <= end;
      });
    }

    const daysMap: Record<Exclude<typeof range, 'custom' | 'all'>, number> = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      '90d': 90,
    } as const;

    const selectedDays = daysMap[range as '7d' | '14d' | '30d' | '90d'] ?? 14;
    const cutoff = now - selectedDays * day;
    return sorted.filter((x) => toDate(x.date).getTime() >= cutoff);
  };

  const filterByMetrics = (items: MentalHealthData[]) => {
    return items.filter((x) => {
      if (fMood && (x.mood == null)) return false;
      if (fStress && (x.stressLevel == null)) return false;
      if (fMeditation && (x.meditationMinutes == null || x.meditationMinutes <= 0)) return false;
      return true;
    });
  };

  const filtered = filterByMetrics(filterByRange(data));

  const csvEscape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return '"' + s.replaceAll('"', '""') + '"';
  };

  const downloadCsv = (rows: string[][], filename: string) => {
    const csv = rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
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
    const rows: string[][] = [headers.map(csvEscape)];
    filtered.forEach((e) => {
      rows.push([
        csvEscape(new Date(e.date as any).toISOString()),
        csvEscape(e.mood ?? ''),
        csvEscape(e.stressLevel ?? ''),
        csvEscape(e.anxietyLevel ?? ''),
        csvEscape(e.energyLevel ?? ''),
        csvEscape(e.meditationMinutes ?? ''),
        csvEscape(e.journalingDone ? 'yes' : 'no'),
        csvEscape(e.socialConnection ?? ''),
        csvEscape(e.gratitudePractice ? 'yes' : 'no'),
        csvEscape(e.notes ?? ''),
      ]);
    });
    const stamp = new Date().toISOString().slice(0,10).replaceAll('-', '');
    downloadCsv(rows, `mental-data-${stamp}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mental Health Entries</h3>
                <p className="text-sm text-gray-500">Your recent mental health assessments</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['7d','14d','30d','90d','all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-md text-sm ${range === r ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  aria-pressed={range === r}
                >
                  {r.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => setRange('custom')}
                className={`px-3 py-1.5 rounded-md text-sm ${range === 'custom' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-pressed={range === 'custom'}
              >
                Custom
              </button>
              {range === 'custom' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600" htmlFor="ment-start">From</label>
                  <input
                    id="ment-start"
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Mental start date"
                  />
                  <label className="text-sm text-gray-600" htmlFor="ment-end">To</label>
                  <input
                    id="ment-end"
                    type="date"
                    className="input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="Mental end date"
                  />
                </div>
              )}
              <button onClick={handleExportCsv} className="btn-secondary ml-2">Export CSV</button>
            </div>
          </div>

          {/* Metric filters */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={fMood} onChange={(e) => setFMood(e.target.checked)} />
              <span className="text-gray-600">With Mood</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={fStress} onChange={(e) => setFStress(e.target.checked)} />
              <span className="text-gray-600">With Stress</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={fMeditation} onChange={(e) => setFMeditation(e.target.checked)} />
              <span className="text-gray-600">With Meditation</span>
            </label>
          </div>
        </div>
        <div className="card-content">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No mental health data for the selected filters</p>
              <p className="text-sm text-gray-400">Adjust the filters or add a new entry</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.slice().reverse().map((entry) => (
                <div key={entry.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                    {entry.journalingDone ? (
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full px-2 py-0.5">
                        Journaled
                      </span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Mood</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.mood ?? '—'}{entry.mood ? '/5' : ''}</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Stress</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.stressLevel ?? '—'}{entry.stressLevel ? '/5' : ''}</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Energy</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.energyLevel ?? '—'}{entry.energyLevel ? '/5' : ''}</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Meditation</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.meditationMinutes ?? '—'}{entry.meditationMinutes ? ' min' : ''}</p>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-3">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
