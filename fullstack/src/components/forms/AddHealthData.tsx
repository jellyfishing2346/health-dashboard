import React, { useEffect, useRef, useState } from 'react';
import { X, Heart, Brain, Save, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PhysicalHealthData, MentalHealthData } from '@/types/health';

interface AddHealthDataProps {
  onClose: () => void;
  onSavePhysical: (data: PhysicalHealthData) => void;
  onSaveMental: (data: MentalHealthData) => void;
  userId: string;
}

export const AddHealthData: React.FC<AddHealthDataProps> = (props) => {
  const { onClose, onSavePhysical, onSaveMental, userId } = props;
  const [activeTab, setActiveTab] = useState<'physical' | 'mental'>('physical');
  const [date, setDate] = useState(() => {
    // Use local date (YYYY-MM-DD) to avoid off-by-one with UTC ISO
    try {
      return new Date().toLocaleDateString('en-CA');
    } catch {
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split('T')[0];
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // a11y: focus management
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedEl = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previouslyFocusedEl.current = document.activeElement as HTMLElement | null;
    // focus the close button on mount
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        // basic focus trap
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const target = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (target === first || !dialogRef.current?.contains(target)) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (target === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // restore focus
      previouslyFocusedEl.current?.focus?.();
    };
  }, [onClose]);

  const [physicalData, setPhysicalData] = useState({
    heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', weight: '', sleepHours: '', sleepQuality: '', exerciseMinutes: '', exerciseType: '', exerciseIntensity: 'moderate' as 'low' | 'moderate' | 'high', steps: '', waterIntake: '', notes: '',
  });

  const [mentalData, setMentalData] = useState({
    mood: '', stressLevel: '', anxietyLevel: '', energyLevel: '', meditationMinutes: '', journalingDone: false, socialConnection: '', gratitudePractice: false, notes: '',
  });

  // basic validation: enable save if at least one field (besides notes-only) is provided
  const canSavePhysical = Boolean(
    physicalData.heartRate ||
    physicalData.bloodPressureSystolic ||
    physicalData.bloodPressureDiastolic ||
    physicalData.weight ||
    physicalData.sleepHours ||
    physicalData.sleepQuality ||
    physicalData.exerciseMinutes ||
    physicalData.exerciseType ||
    physicalData.steps ||
    physicalData.waterIntake ||
    physicalData.notes
  );

  const canSaveMental = Boolean(
    mentalData.mood ||
    mentalData.stressLevel ||
    mentalData.anxietyLevel ||
    mentalData.energyLevel ||
    mentalData.meditationMinutes ||
    mentalData.journalingDone ||
    mentalData.socialConnection ||
    mentalData.gratitudePractice ||
    mentalData.notes
  );

  const handlePhysicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!canSavePhysical) return; setIsSubmitting(true);
    const data: PhysicalHealthData = {
      id: uuidv4(), userId, date: new Date(`${date}T12:00:00Z`),
      heartRate: physicalData.heartRate ? parseInt(physicalData.heartRate) : undefined,
      bloodPressureSystolic: physicalData.bloodPressureSystolic ? parseInt(physicalData.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: physicalData.bloodPressureDiastolic ? parseInt(physicalData.bloodPressureDiastolic) : undefined,
      weight: physicalData.weight ? parseFloat(physicalData.weight) : undefined,
      sleepHours: physicalData.sleepHours ? parseFloat(physicalData.sleepHours) : undefined,
      sleepQuality: physicalData.sleepQuality ? (parseInt(physicalData.sleepQuality) as 1|2|3|4|5) : undefined,
      exerciseMinutes: physicalData.exerciseMinutes ? parseInt(physicalData.exerciseMinutes) : undefined,
      exerciseType: physicalData.exerciseType || undefined,
      exerciseIntensity: physicalData.exerciseIntensity || undefined,
      steps: physicalData.steps ? parseInt(physicalData.steps) : undefined,
      waterIntake: physicalData.waterIntake ? parseFloat(physicalData.waterIntake) : undefined,
      notes: physicalData.notes || undefined,
    };
    onSavePhysical(data); setIsSubmitting(false); onClose();
  };

  const handleMentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!canSaveMental) return; setIsSubmitting(true);
    const data: MentalHealthData = {
      id: uuidv4(), userId, date: new Date(`${date}T12:00:00Z`),
      mood: mentalData.mood ? (parseInt(mentalData.mood) as 1|2|3|4|5) : undefined,
      stressLevel: mentalData.stressLevel ? (parseInt(mentalData.stressLevel) as 1|2|3|4|5) : undefined,
      anxietyLevel: mentalData.anxietyLevel ? (parseInt(mentalData.anxietyLevel) as 1|2|3|4|5) : undefined,
      energyLevel: mentalData.energyLevel ? (parseInt(mentalData.energyLevel) as 1|2|3|4|5) : undefined,
      meditationMinutes: mentalData.meditationMinutes ? parseInt(mentalData.meditationMinutes) : undefined,
      journalingDone: mentalData.journalingDone,
      socialConnection: mentalData.socialConnection ? (parseInt(mentalData.socialConnection) as 1|2|3|4|5) : undefined,
      gratitudePractice: mentalData.gratitudePractice,
      notes: mentalData.notes || undefined,
    };
    onSaveMental(data); setIsSubmitting(false); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" aria-labelledby="add-health-title" aria-modal="true" role="dialog">
      <div ref={dialogRef} className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              {activeTab === 'physical' ? (<Heart className="h-5 w-5 text-primary-600" />) : (<Brain className="h-5 w-5 text-primary-600" />)}
            </div>
            <div>
              <h2 id="add-health-title" className="text-xl font-semibold text-gray-900">Add Health Data</h2>
              <p className="text-sm text-gray-500">Track your {activeTab} health metrics</p>
            </div>
          </div>
          <button ref={closeBtnRef} onClick={onClose} className="btn-ghost p-2" aria-label="Close add health data dialog"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Select health category">
            <button onClick={() => setActiveTab('physical')} role="tab" aria-selected={activeTab === 'physical'} className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'physical' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Heart className="h-4 w-4" /><span>Physical Health</span>
            </button>
            <button onClick={() => setActiveTab('mental')} role="tab" aria-selected={activeTab === 'mental'} className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'mental' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Brain className="h-4 w-4" /><span>Mental Health</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="h-4 w-4 inline mr-2" />Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field max-w-xs" aria-label="Entry date" />
            <p className="mt-1 text-xs text-gray-500">Tip: Provide any value below to enable Save.</p>
          </div>

          {activeTab === 'physical' ? (
            <form onSubmit={handlePhysicalSubmit} className="space-y-6">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center"><Heart className="h-4 w-4 text-red-600 mr-2" />Vital Signs</h3>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label><input type="number" value={physicalData.heartRate} onChange={(e) => setPhysicalData({ ...physicalData, heartRate: e.target.value })} className="input-field" placeholder="70" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label><input type="number" step="0.1" value={physicalData.weight} onChange={(e) => setPhysicalData({ ...physicalData, weight: e.target.value })} className="input-field" placeholder="70.5" /></div>
                </div>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure - Systolic</label><input type="number" value={physicalData.bloodPressureSystolic} onChange={(e) => setPhysicalData({ ...physicalData, bloodPressureSystolic: e.target.value })} className="input-field" placeholder="120" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure - Diastolic</label><input type="number" value={physicalData.bloodPressureDiastolic} onChange={(e) => setPhysicalData({ ...physicalData, bloodPressureDiastolic: e.target.value })} className="input-field" placeholder="80" /></div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Sleep</h3>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Sleep Hours</label><input type="number" step="0.5" value={physicalData.sleepHours} onChange={(e) => setPhysicalData({ ...physicalData, sleepHours: e.target.value })} className="input-field" placeholder="8" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Sleep Quality (1-5)</label><select value={physicalData.sleepQuality} onChange={(e) => setPhysicalData({ ...physicalData, sleepQuality: e.target.value })} className="input-field"><option value="">Select quality</option><option value="1">1 - Very Poor</option><option value="2">2 - Poor</option><option value="3">3 - Fair</option><option value="4">4 - Good</option><option value="5">5 - Excellent</option></select></div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Exercise & Activity</h3>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Exercise Duration (minutes)</label><input type="number" value={physicalData.exerciseMinutes} onChange={(e) => setPhysicalData({ ...physicalData, exerciseMinutes: e.target.value })} className="input-field" placeholder="30" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Exercise Type</label><input type="text" value={physicalData.exerciseType} onChange={(e) => setPhysicalData({ ...physicalData, exerciseType: e.target.value })} className="input-field" placeholder="Running, Swimming, etc." /></div>
                </div>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Exercise Intensity</label><select value={physicalData.exerciseIntensity} onChange={(e) => setPhysicalData({ ...physicalData, exerciseIntensity: e.target.value as 'low'|'moderate'|'high' })} className="input-field"><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Steps</label><input type="number" value={physicalData.steps} onChange={(e) => setPhysicalData({ ...physicalData, steps: e.target.value })} className="input-field" placeholder="10000" /></div>
                </div>
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-2">Water Intake (liters)</label><input type="number" step="0.1" value={physicalData.waterIntake} onChange={(e) => setPhysicalData({ ...physicalData, waterIntake: e.target.value })} className="input-field max-w-xs" placeholder="2.5" /></div>

              <div><label className="block text-sm font-medium text-gray-700 mb-2">Notes</label><textarea value={physicalData.notes} onChange={(e) => setPhysicalData({ ...physicalData, notes: e.target.value })} className="input-field" rows={3} placeholder="Any additional notes about your physical health..." /></div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Save is enabled after adding at least one value.</p>
                <div className="space-x-3">
                  <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !canSavePhysical} className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"><Save className="h-4 w-4" /><span>{isSubmitting ? 'Saving...' : 'Save Physical Data'}</span></button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMentalSubmit} className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4"><Brain className="h-4 w-4 text-purple-600 mr-2 inline" />Mood & Emotions</h3>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Overall Mood (1-5)</label><select value={mentalData.mood} onChange={(e) => setMentalData({ ...mentalData, mood: e.target.value })} className="input-field"><option value="">Select mood</option><option value="1">1 - Very Sad</option><option value="2">2 - Sad</option><option value="3">3 - Neutral</option><option value="4">4 - Happy</option><option value="5">5 - Very Happy</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Stress Level (1-5)</label><select value={mentalData.stressLevel} onChange={(e) => setMentalData({ ...mentalData, stressLevel: e.target.value })} className="input-field"><option value="">Select stress level</option><option value="1">1 - No Stress</option><option value="2">2 - Low Stress</option><option value="3">3 - Moderate Stress</option><option value="4">4 - High Stress</option><option value="5">5 - Very High Stress</option></select></div>
                </div>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Anxiety Level (1-5)</label><select value={mentalData.anxietyLevel} onChange={(e) => setMentalData({ ...mentalData, anxietyLevel: e.target.value })} className="input-field"><option value="">Select anxiety level</option><option value="1">1 - No Anxiety</option><option value="2">2 - Low Anxiety</option><option value="3">3 - Moderate Anxiety</option><option value="4">4 - High Anxiety</option><option value="5">5 - Very High Anxiety</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Energy Level (1-5)</label><select value={mentalData.energyLevel} onChange={(e) => setMentalData({ ...mentalData, energyLevel: e.target.value })} className="input-field"><option value="">Select energy level</option><option value="1">1 - Very Low</option><option value="2">2 - Low</option><option value="3">3 - Moderate</option><option value="4">4 - High</option><option value="5">5 - Very High</option></select></div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Mindfulness & Activities</h3>
                <div className="form-grid">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Meditation (minutes)</label><input type="number" value={mentalData.meditationMinutes} onChange={(e) => setMentalData({ ...mentalData, meditationMinutes: e.target.value })} className="input-field" placeholder="10" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Social Connection (1-5)</label><select value={mentalData.socialConnection} onChange={(e) => setMentalData({ ...mentalData, socialConnection: e.target.value })} className="input-field"><option value="">Select connection level</option><option value="1">1 - Very Isolated</option><option value="2">2 - Somewhat Isolated</option><option value="3">3 - Neutral</option><option value="4">4 - Well Connected</option><option value="5">5 - Very Connected</option></select></div>
                </div>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center"><input type="checkbox" id="journaling" checked={mentalData.journalingDone} onChange={(e) => setMentalData({ ...mentalData, journalingDone: e.target.checked })} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" /><label htmlFor="journaling" className="ml-2 text-sm font-medium text-gray-700">Journaling Done</label></div>
                  <div className="flex items-center"><input type="checkbox" id="gratitude" checked={mentalData.gratitudePractice} onChange={(e) => setMentalData({ ...mentalData, gratitudePractice: e.target.checked })} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" /><label htmlFor="gratitude" className="ml-2 text-sm font-medium text-gray-700">Gratitude Practice</label></div>
                </div>
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-2">Notes</label><textarea value={mentalData.notes} onChange={(e) => setMentalData({ ...mentalData, notes: e.target.value })} className="input-field" rows={3} placeholder="Any additional notes about your mental health..." /></div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Save is enabled after adding at least one value.</p>
                <div className="space-x-3">
                  <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !canSaveMental} className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"><Save className="h-4 w-4" /><span>{isSubmitting ? 'Saving...' : 'Save Mental Data'}</span></button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
