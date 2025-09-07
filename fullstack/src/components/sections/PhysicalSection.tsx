import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import type { PhysicalHealthData } from '@/types/health';
import { exportPhysicalCSV } from '@/utils/csv';

interface PhysicalSectionProps { data: PhysicalHealthData[] }

export const PhysicalSection: React.FC<PhysicalSectionProps> = ({ data }) => {
  const [range, setRange] = useState<'7d'|'14d'|'30d'|'90d'|'all'|'custom'>('14d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fHeartRate, setFHeartRate] = useState(false);
  const [fExercise, setFExercise] = useState(false);
  const [fSleep, setFSleep] = useState(false);

  const toDate = (d: any) => new Date(d);
  const formatDate = (d: any) => toDate(d).toLocaleDateString(undefined, { timeZone: 'UTC' });
  const filterByRange = (items: PhysicalHealthData[]) => {
    const sorted = items.slice().sort((a,b)=>+toDate(a.date)-+toDate(b.date));
    const now = Date.now();
    const day = 86400000;
    if (range === 'all') return sorted;
    if (range === 'custom' && startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime() + (day - 1);
      return sorted.filter(x => { const t = toDate(x.date).getTime(); return t>=s && t<=e; });
    }
    const map = { '7d':7,'14d':14,'30d':30,'90d':90 } as const;
    const days = map[range as '7d'|'14d'|'30d'|'90d'] ?? 14;
    const cutoff = now - days*day;
    return sorted.filter(x => toDate(x.date).getTime() >= cutoff);
  };
  const filterByMetrics = (items: PhysicalHealthData[]) => items.filter(x => {
    if (fHeartRate && x.heartRate==null) return false;
    if (fExercise && (x.exerciseMinutes==null || x.exerciseMinutes<=0)) return false;
    if (fSleep && x.sleepHours==null) return false;
    return true;
  });
  const filtered = filterByMetrics(filterByRange(data));

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Heart className="h-5 w-5 text-red-600" /></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Physical Health Entries</h3>
                <p className="text-sm text-gray-500">Your recent measurements and activities</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['7d','14d','30d','90d','all'] as const).map(r => (
                <button key={r} onClick={()=>setRange(r)} className={`px-3 py-1.5 rounded-md text-sm ${range===r?'bg-primary-100 text-primary-700':'text-gray-600 hover:bg-gray-100'}`}>{r.toUpperCase()}</button>
              ))}
              <button onClick={()=>setRange('custom')} className={`px-3 py-1.5 rounded-md text-sm ${range==='custom'?'bg-primary-100 text-primary-700':'text-gray-600 hover:bg-gray-100'}`}>Custom</button>
              {range==='custom' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600" htmlFor="phys-start">From</label>
                  <input id="phys-start" type="date" className="input-field" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                  <label className="text-sm text-gray-600" htmlFor="phys-end">To</label>
                  <input id="phys-end" type="date" className="input-field" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                </div>
              )}
              {/* Export CSV */}
              <button
                onClick={() => exportPhysicalCSV(filtered)}
                className="btn-secondary disabled:opacity-50"
                disabled={filtered.length === 0}
                aria-disabled={filtered.length === 0}
                title={filtered.length === 0 ? 'No data to export' : 'Export filtered data as CSV'}
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={fHeartRate} onChange={e=>setFHeartRate(e.target.checked)} /><span className="text-gray-600">With Heart Rate</span></label>
            <label className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={fExercise} onChange={e=>setFExercise(e.target.checked)} /><span className="text-gray-600">With Exercise</span></label>
            <label className="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={fSleep} onChange={e=>setFSleep(e.target.checked)} /><span className="text-gray-600">With Sleep</span></label>
          </div>
        </div>
        <div className="card-content">
          {filtered.length===0 ? (
            <div className="text-center py-10">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No physical health data for the selected filters</p>
              <p className="text-sm text-gray-400">Adjust the filters or add a new entry</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.slice().reverse().map(entry => (
                <div key={entry.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                    {entry.exerciseMinutes ? (
                      <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">{entry.exerciseMinutes} min exercise</span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gray-50 rounded p-3"><p className="text-xs text-gray-600">Heart Rate</p><p className="text-lg font-semibold text-gray-900">{entry.heartRate ?? '\u2014'}{entry.heartRate ? ' bpm' : ''}</p></div>
                    <div className="text-center bg-gray-50 rounded p-3"><p className="text-xs text-gray-600">Weight</p><p className="text-lg font-semibold text-gray-900">{entry.weight ?? '\u2014'}{entry.weight ? ' kg' : ''}</p></div>
                    <div className="text-center bg-gray-50 rounded p-3"><p className="text-xs text-gray-600">Blood Pressure</p><p className="text-lg font-semibold text-gray-900">{entry.bloodPressureSystolic && entry.bloodPressureDiastolic ? `${entry.bloodPressureSystolic}/${entry.bloodPressureDiastolic}` : '\u2014'}</p></div>
                    <div className="text-center bg-gray-50 rounded p-3"><p className="text-xs text-gray-600">Sleep</p><p className="text-lg font-semibold text-gray-900">{entry.sleepHours ?? '\u2014'}{entry.sleepHours ? ' h' : ''}</p></div>
                  </div>
                  {entry.notes && <p className="text-sm text-gray-600 mt-3">{entry.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(d:any){ return new Date(d).toLocaleDateString(undefined, { timeZone: 'UTC' }); }
