'use client'

import React from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AddHealthData } from '@/components/forms/AddHealthData';
import { ProfileSetup } from '@/components/forms/ProfileSetup';
import { PhysicalSection } from '@/components/sections/PhysicalSection';
import { MentalSection } from '@/components/sections/MentalSection';
import { GoalsSection } from '@/components/sections/GoalsSection';
import type { UserProfile, PhysicalHealthData, MentalHealthData, Goal } from '@/types/health';
import { useSession, signIn } from 'next-auth/react';
import { useProfile, usePhysical, useMental, useGoals, optimisticPost, optimisticPut, optimisticDelete } from '@/hooks/useApi';

function useAppState() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [showAddData, setShowAddData] = React.useState(false);
  const isAuthed = status === 'authenticated';

  // SWR data
  const { data: profileData } = useProfile();
  const { data: physicalRaw } = usePhysical();
  const { data: mentalRaw } = useMental();
  const { data: goalsRaw } = useGoals();

  const userProfile: UserProfile | null = React.useMemo(() => {
    if (!isAuthed || !profileData) return null;
    return {
      id: 'server-profile',
      name: (session?.user?.name || session?.user?.email || 'You') as string,
      age: profileData.age,
      gender: profileData.gender,
      height: profileData.height,
      weight: profileData.weight,
      goals: [],
      createdAt: new Date(profileData.createdAt || Date.now()),
    } as UserProfile;
  }, [isAuthed, profileData, session?.user?.name, session?.user?.email]);

  const physicalData: PhysicalHealthData[] = React.useMemo(() => {
    return (physicalRaw || []).map((e: any) => ({ ...e, date: new Date(e.date) }));
  }, [physicalRaw]);

  const mentalData: MentalHealthData[] = React.useMemo(() => {
    return (mentalRaw || []).map((e: any) => ({ ...e, date: new Date(e.date) }));
  }, [mentalRaw]);

  const goals: Goal[] = React.useMemo(() => {
    return (goalsRaw || []).map((g: any) => ({ ...g, targetDate: g.targetDate ? new Date(g.targetDate) : undefined, createdAt: g.createdAt ? new Date(g.createdAt) : undefined }));
  }, [goalsRaw]);

  // Open Add Data from global event
  React.useEffect(() => {
    const handler = () => setShowAddData(true);
    window.addEventListener('open-add-data' as any, handler as any);
    return () => window.removeEventListener('open-add-data' as any, handler as any);
  }, []);

  // Save profile
  const saveProfile = async (p: UserProfile) => {
    if (!isAuthed) { signIn('google'); return; }
    try {
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ age: p.age, gender: p.gender, height: p.height, weight: p.weight }) });
      if (!res.ok) throw new Error('Failed to save profile');
      setActiveTab('dashboard');
    } catch (e) {
      console.error(e);
      alert('Could not save profile.');
    }
  };

  // Mutations with optimistic updates
  const savePhysical = async (d: PhysicalHealthData) => {
    if (!isAuthed) { signIn('google'); return; }
    const dd = new Date(d.date);
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    const payloadDate = `${y}-${m}-${day}T12:00:00.000Z`;
    await optimisticPost<PhysicalHealthData>(
      '/api/physical',
      { ...d, date: payloadDate },
      '/api/physical',
      (prev) => [...prev, { ...d, id: `temp-${Date.now()}`, date: new Date(payloadDate) } as any]
    ).catch((e) => { console.error(e); alert('Could not save physical data.'); });
  };

  const saveMental = async (d: MentalHealthData) => {
    if (!isAuthed) { signIn('google'); return; }
    const dd = new Date(d.date);
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    const payloadDate = `${y}-${m}-${day}T12:00:00.000Z`;
    await optimisticPost<MentalHealthData>(
      '/api/mental',
      { ...d, date: payloadDate },
      '/api/mental',
      (prev) => [...prev, { ...d, id: `temp-${Date.now()}`, date: new Date(payloadDate) } as any]
    ).catch((e) => { console.error(e); alert('Could not save mental data.'); });
  };

  const addGoal = async (title: string) => {
    if (!isAuthed) { signIn('google'); return; }
    const payload = { title, description: '', category: 'both', targetValue: 0, currentValue: 0, unit: '', targetDate: new Date().toISOString(), completed: false };
    await optimisticPost<Goal>(
      '/api/goals',
      payload,
      '/api/goals',
      (prev) => [{ ...payload, id: `temp-${Date.now()}`, createdAt: new Date(), userId: 'self' } as any, ...prev]
    ).catch((e) => { console.error(e); alert('Could not add goal.'); });
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    if (!isAuthed) { signIn('google'); return; }
    const existing = (goals || []).find((g) => g.id === goalId);
    if (!existing) return;
    const payload = { ...existing, completed, targetDate: existing.targetDate ? new Date(existing.targetDate).toISOString() : undefined } as any;
    await optimisticPut<Goal>(
      '/api/goals',
      payload,
      '/api/goals',
      (prev) => prev.map((g: any) => (g.id === goalId ? { ...g, completed } : g))
    ).catch((e) => { console.error(e); alert('Could not update goal.'); });
  };

  const deleteGoal = async (goalId: string) => {
    if (!isAuthed) { signIn('google'); return; }
    await optimisticDelete<Goal>(
      `/api/goals?id=${encodeURIComponent(goalId)}`,
      '/api/goals',
      (prev) => prev.filter((g: any) => g.id !== goalId)
    ).catch((e) => { console.error(e); alert('Could not delete goal.'); });
  };

  const updateGoal = async (goal: Goal) => {
    if (!isAuthed) { signIn('google'); return; }
    const payload = { ...goal, targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : undefined } as any;
    await optimisticPut<Goal>(
      '/api/goals',
      payload,
      '/api/goals',
      (prev) => prev.map((g: any) => (g.id === goal.id ? { ...g, ...payload } : g))
    ).catch((e) => { console.error(e); alert('Could not update goal.'); });
  };

  return {
    session, status, isAuthed,
    activeTab, setActiveTab,
    showAddData, setShowAddData,
    userProfile, saveProfile,
    physicalData, mentalData, goals,
    savePhysical, saveMental,
    addGoal, toggleGoal, deleteGoal, updateGoal,
  } as const;
}

export default function HomePage() {
  const s = useAppState();
  const uid = s.session?.user?.id;

  const needsProfile = s.isAuthed && !s.userProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={s.activeTab}
        onTabChange={s.setActiveTab}
        onAddData={() => (s.isAuthed ? s.setShowAddData(true) : signIn('google'))}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {needsProfile ? (
          <ProfileSetup onSave={s.saveProfile} existingProfile={null} />
        ) : (
          <>
            {s.activeTab === 'dashboard' && (
              <DashboardOverview
                userProfile={s.userProfile}
                physicalData={s.physicalData}
                mentalData={s.mentalData}
                goals={s.goals}
              />
            )}

            {s.activeTab === 'physical' && (
              <PhysicalSection data={s.physicalData} />
            )}

            {s.activeTab === 'mental' && (
              <MentalSection data={s.mentalData} />
            )}

            {s.activeTab === 'goals' && (
              <GoalsSection
                goals={s.goals}
                onAddGoal={s.addGoal}
                onToggleGoal={s.toggleGoal}
                onDeleteGoal={s.deleteGoal}
                onUpdateGoal={s.updateGoal}
              />
            )}

            {s.activeTab === 'profile' && (
              <ProfileSetup onSave={s.saveProfile} existingProfile={s.userProfile || undefined} />
            )}
          </>
        )}
      </main>

      {s.showAddData && s.isAuthed && (
        <AddHealthData
          onClose={() => s.setShowAddData(false)}
          onSavePhysical={s.savePhysical}
          onSaveMental={s.saveMental}
          userId={uid ?? 'self'}
        />
      )}
    </div>
  );
}
