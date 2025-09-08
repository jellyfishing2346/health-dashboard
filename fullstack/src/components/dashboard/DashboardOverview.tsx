import { Heart, Brain, Target, Calendar, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import type { UserProfile, PhysicalHealthData, MentalHealthData, Goal } from '@/types/health';
import { Trends } from '@/components/charts/Trends';
import React from 'react';

interface DashboardOverviewProps {
  userProfile: UserProfile | null;
  physicalData: PhysicalHealthData[];
  mentalData: MentalHealthData[];
  goals?: Goal[];
}

export function DashboardOverview({ userProfile, physicalData, mentalData, goals }: DashboardOverviewProps) {
  if (!userProfile) return null;

  const recentPhysical = physicalData.slice(-7);
  const recentMental = mentalData.slice(-7);
  const latestPhysical = physicalData[physicalData.length - 1];
  const latestMental = mentalData[mentalData.length - 1];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const activeGoalsCount = goals ? goals.filter(g => !g.completed).length : (userProfile.goals || []).length;

  const [insights, setInsights] = React.useState<string[] | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[] | null>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(false);
  const [errorInsights, setErrorInsights] = React.useState<string | null>(null);
  const [usedFallback, setUsedFallback] = React.useState(false);
  const [cooldownUntil, setCooldownUntil] = React.useState<number | null>(null);

  const hasAnyData = physicalData.length > 0 || mentalData.length > 0;
  const inCooldown = cooldownUntil ? Date.now() < cooldownUntil : false;

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      setErrorInsights(null);
      setUsedFallback(false);
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: userProfile, physical: physicalData, mental: mentalData, goals }),
      });
      const json = await res.json();
      if (res.ok) {
        setInsights(json.insights || []);
        setSuggestions(json.suggestions || []);
        return;
      }
      // Graceful fallback when quota is exceeded
      if (res.status === 429 && json?.error === 'quota_exceeded' && json?.fallback) {
        setInsights(json.fallback.insights || []);
        setSuggestions(json.fallback.suggestions || []);
        setErrorInsights('Using offline tips (quota exceeded).');
        setUsedFallback(true);
        setCooldownUntil(Date.now() + 60_000); // 60s cooldown
        return;
      }
      throw new Error(json.error || 'Failed to fetch insights');
    } catch (e: any) {
      setErrorInsights(e.message || 'Failed to fetch insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {userProfile.name}!</h1>
            <p className="text-primary-100 text-lg mb-4">{getTodayDate()}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Age {userProfile.age}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{activeGoalsCount} Active Goals</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard metric={{ label: 'Heart Rate', value: latestPhysical?.heartRate || 0, unit: 'bpm', trend: recentPhysical.length > 1 ? 'up' : 'stable', color: '#dc2626' }} />
        <MetricCard metric={{ label: 'Mood Score', value: latestMental?.mood || 0, unit: '/5', trend: recentMental.length > 1 ? 'up' : 'stable', color: '#9333ea' }} />
        <MetricCard metric={{ label: 'Exercise (Week)', value: recentPhysical.filter(d => d.exerciseMinutes && d.exerciseMinutes > 0).length, unit: 'days', trend: 'up', color: '#16a34a' }} />
        <MetricCard metric={{ label: 'Sleep Average', value: latestPhysical?.sleepHours || 0, unit: 'h', trend: 'stable', color: '#2563eb' }} />
      </div>

      <Trends physicalData={physicalData} mentalData={mentalData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personalized Insights</h3>
                <p className="text-sm text-gray-500">AI-generated from your recent data</p>
              </div>
              <div className="flex-1" />
              <button
                className="btn-secondary disabled:opacity-50"
                onClick={fetchInsights}
                disabled={loadingInsights || !hasAnyData || inCooldown}
                aria-disabled={!hasAnyData || inCooldown}
                title={!hasAnyData ? 'Add some data to generate insights' : inCooldown ? 'Temporarily paused due to quota; try again shortly.' : ''}
              >
                {loadingInsights ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
          <div className="card-content">
            {errorInsights && <p className="text-sm text-red-600">{errorInsights}</p>}
            {usedFallback && (
              <p className="text-xs text-gray-500">These tips are generated locally as a fallback.</p>
            )}
            {insights && insights.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {insights.map((i, idx) => (<li key={idx}>{i}</li>))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{hasAnyData ? 'Click Generate to get insights.' : 'Add data to generate insights.'}</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Suggested Actions</h3>
            <p className="text-sm text-gray-500">Quick wins for today</p>
          </div>
          <div className="card-content">
            {suggestions && suggestions.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {suggestions.map((s, idx) => (<li key={idx}>{s}</li>))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{hasAnyData ? 'Generate insights to see suggestions.' : 'Add data to get suggestions.'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
                <p className="text-sm text-gray-500">{activeGoalsCount} active goals</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card-content">
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((g) => (
                <div key={g.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {g.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`font-medium ${g.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{g.title}</span>
                  </div>
                  <span className={`text-sm font-medium ${g.completed ? 'text-gray-500' : 'text-green-600'}`}>
                    {g.completed ? 'Completed' : 'Active'}
                  </span>
                </div>
              ))}
              {goals.length > 3 && <p className="text-sm text-gray-500 text-center">+{goals.length - 3} more goals</p>}
            </div>
          ) : (userProfile.goals || []).length > 0 ? (
            <div className="space-y-4">
              {(userProfile.goals || []).slice(0, 3).map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-medium text-gray-900">{goal}</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              ))}
              {(userProfile.goals || []).length > 3 && (
                <p className="text-sm text-gray-500 text-center">+{(userProfile.goals || []).length - 3} more goals</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No goals set yet</p>
              <p className="text-sm text-gray-400">Set some goals to track your progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
