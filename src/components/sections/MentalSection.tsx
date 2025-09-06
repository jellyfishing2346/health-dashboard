import React from 'react';
import { Brain } from 'lucide-react';
import type { MentalHealthData } from '../../types/health';

interface MentalSectionProps {
  data: MentalHealthData[];
}

export const MentalSection: React.FC<MentalSectionProps> = ({ data }) => {
  const formatDate = (d: any) => new Date(d).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mental Health Entries</h3>
              <p className="text-sm text-gray-500">Your recent mental health assessments</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          {data.length === 0 ? (
            <div className="text-center py-10">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No mental health data yet</p>
              <p className="text-sm text-gray-400">Use "Add Data" to record a new entry</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.slice().reverse().map((entry) => (
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
