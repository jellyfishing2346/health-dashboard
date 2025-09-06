import React from 'react';
import { Heart } from 'lucide-react';
import type { PhysicalHealthData } from '../../types/health';

interface PhysicalSectionProps {
  data: PhysicalHealthData[];
}

export const PhysicalSection: React.FC<PhysicalSectionProps> = ({ data }) => {
  const formatDate = (d: any) => new Date(d).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Physical Health Entries</h3>
              <p className="text-sm text-gray-500">Your recent measurements and activities</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          {data.length === 0 ? (
            <div className="text-center py-10">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No physical health data yet</p>
              <p className="text-sm text-gray-400">Use "Add Data" to record a new entry</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.slice().reverse().map((entry) => (
                <div key={entry.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                    {entry.exerciseMinutes ? (
                      <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                        {entry.exerciseMinutes} min exercise
                      </span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Heart Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.heartRate ?? '—'}{entry.heartRate ? ' bpm' : ''}</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Weight</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.weight ?? '—'}{entry.weight ? ' kg' : ''}</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Blood Pressure</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {entry.bloodPressureSystolic && entry.bloodPressureDiastolic
                          ? `${entry.bloodPressureSystolic}/${entry.bloodPressureDiastolic}`
                          : '—'}
                      </p>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Sleep</p>
                      <p className="text-lg font-semibold text-gray-900">{entry.sleepHours ?? '—'}{entry.sleepHours ? ' h' : ''}</p>
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
