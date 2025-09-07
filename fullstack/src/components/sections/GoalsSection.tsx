import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Trash2, Save, Edit3, X } from 'lucide-react';
import type { Goal } from '@/types/health';

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (title: string) => void;
  onToggleGoal: (goalId: string, completed: boolean) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateGoal: (goal: Goal) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ goals, onAddGoal, onToggleGoal, onDeleteGoal, onUpdateGoal }) => {
  const [newGoal, setNewGoal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<Goal>>>({});

  const handleAdd = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    onAddGoal(trimmed);
    setNewGoal('');
  };

  const pct = (g: Goal) => {
    const t = g.targetValue || 0;
    const c = g.currentValue || 0;
    if (t <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((c / t) * 100)));
  };

  const startEdit = (g: Goal) => {
    setEditingId(g.id);
    setDrafts((d) => ({
      ...d,
      [g.id]: {
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        targetDate: g.targetDate,
        title: g.title,
      },
    }));
  };

  const cancelEdit = (id: string) => {
    setEditingId(null);
    setDrafts((d) => {
      const { [id]: _omit, ...rest } = d;
      return rest;
    });
  };

  const saveEdit = (g: Goal) => {
    const draft = drafts[g.id] || {};
    const updated: Goal = {
      ...g,
      title: draft.title ?? g.title,
      targetValue: Number(draft.targetValue ?? g.targetValue) || 0,
      currentValue: Number(draft.currentValue ?? g.currentValue) || 0,
      unit: (draft.unit ?? g.unit) || '',
      targetDate: draft.targetDate ? new Date(draft.targetDate as any) : g.targetDate,
    };
    onUpdateGoal(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
                <p className="text-sm text-gray-500">Create, complete, and track progress</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="flex items-center space-x-3 mb-4">
            <input type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a new goal (e.g., Walk 8k steps)" className="input-field flex-1" />
            <button onClick={handleAdd} className="btn-primary flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Add</span></button>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-10">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No goals yet</p>
              <p className="text-sm text-gray-400">Add your first goal above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const isEditing = editingId === g.id;
                const d = drafts[g.id] || {};
                return (
                  <div key={g.id} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <button onClick={() => onToggleGoal(g.id, !g.completed)} className="flex items-center space-x-3 focus:outline-none" aria-label={g.completed ? 'Mark goal as active' : 'Mark goal as complete'}>
                        {g.completed ? (<CheckCircle2 className="w-5 h-5 text-green-600" />) : (<Circle className="w-5 h-5 text-gray-400" />)}
                        <span className={`text-gray-900 ${g.completed ? 'line-through text-gray-500' : ''}`}>{g.title}</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button className="btn-secondary px-2 py-1" onClick={() => saveEdit(g)}><Save className="w-4 h-4" /></button>
                            <button className="btn-ghost p-2" onClick={() => cancelEdit(g.id)}><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <button className="btn-ghost p-2" onClick={() => startEdit(g)}><Edit3 className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => onDeleteGoal(g.id)} className="btn-ghost p-2" aria-label="Delete goal"><Trash2 className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1"><span>Progress</span><span>{pct(g)}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${pct(g) === 100 ? 'bg-green-600' : 'bg-primary-600'}`} style={{ width: `${pct(g)}%` }} /></div>
                      <div className="text-xs text-gray-500 mt-1">{g.currentValue}/{g.targetValue} {g.unit || ''}</div>
                    </div>

                    {isEditing && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div><label className="block text-xs text-gray-600 mb-1">Target</label><input type="number" className="input-field" value={d.targetValue ?? g.targetValue} onChange={(e) => setDrafts((prev) => ({ ...prev, [g.id]: { ...prev[g.id], targetValue: Number(e.target.value) } }))} /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Current</label><input type="number" className="input-field" value={d.currentValue ?? g.currentValue} onChange={(e) => setDrafts((prev) => ({ ...prev, [g.id]: { ...prev[g.id], currentValue: Number(e.target.value) } }))} /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Unit</label><input type="text" className="input-field" value={d.unit ?? g.unit} onChange={(e) => setDrafts((prev) => ({ ...prev, [g.id]: { ...prev[g.id], unit: e.target.value } }))} /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Target Date</label><input type="date" className="input-field" value={(() => { const dt = d.targetDate ?? g.targetDate; return dt ? new Date(dt as any).toISOString().split('T')[0] : ''; })()} onChange={(e) => setDrafts((prev) => ({ ...prev, [g.id]: { ...prev[g.id], targetDate: e.target.value as any } }))} /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
