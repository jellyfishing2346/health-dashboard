import { Heart, Brain, Target, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import type { UserProfile, PhysicalHealthData, MentalHealthData, Goal } from '../../types/health';
import { Trends } from '../charts/Trends';

interface DashboardOverviewProps {
  userProfile: UserProfile | null;
  physicalData: PhysicalHealthData[];
  mentalData: MentalHealthData[];
  goals?: Goal[];
}

export function DashboardOverview({ userProfile, physicalData, mentalData, goals }: DashboardOverviewProps) {
  if (!userProfile) return null;

  // Calculate recent data and trends
  const recentPhysical = physicalData.slice(-7); // Last 7 entries
  const recentMental = mentalData.slice(-7);
  
  const latestPhysical = physicalData[physicalData.length - 1];
  const latestMental = mentalData[mentalData.length - 1];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const activeGoalsCount = goals
    ? goals.filter(g => !g.completed).length
    : (userProfile.goals || []).length;

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {userProfile.name}!
            </h1>
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          metric={{
            label: "Heart Rate",
            value: latestPhysical?.heartRate || 0,
            unit: "bpm",
            trend: recentPhysical.length > 1 ? 'up' : 'stable',
            color: "#dc2626"
          }}
        />
        
        <MetricCard
          metric={{
            label: "Mood Score",
            value: latestMental?.mood || 0,
            unit: "/5",
            trend: recentMental.length > 1 ? 'up' : 'stable',
            color: "#9333ea"
          }}
        />
        
        <MetricCard
          metric={{
            label: "Exercise (Week)",
            value: recentPhysical.filter(d => d.exerciseMinutes && d.exerciseMinutes > 0).length,
            unit: "days",
            trend: 'up',
            color: "#16a34a"
          }}
        />
        
        <MetricCard
          metric={{
            label: "Sleep Average",
            value: latestPhysical?.sleepHours || 0,
            unit: "h",
            trend: 'stable',
            color: "#2563eb"
          }}
        />
      </div>

      {/* Trends */}
      <Trends physicalData={physicalData} mentalData={mentalData} />

      {/* Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical Health Summary */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Physical Health</h3>
                <p className="text-sm text-gray-500">Latest measurements</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {latestPhysical ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-xl font-bold text-gray-900">{latestPhysical.weight || 'N/A'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {latestPhysical.bloodPressureSystolic && latestPhysical.bloodPressureDiastolic
                        ? `${latestPhysical.bloodPressureSystolic}/${latestPhysical.bloodPressureDiastolic}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Exercise Duration</p>
                  <p className="text-xl font-bold text-blue-700">{latestPhysical.exerciseMinutes || 0} min</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No physical health data yet</p>
                <p className="text-sm text-gray-400">Start tracking to see your progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Mental Health Summary */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mental Health</h3>
                <p className="text-sm text-gray-500">Latest assessment</p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {latestMental ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Stress Level</p>
                    <p className="text-xl font-bold text-gray-900">{latestMental.stressLevel}/5</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Energy</p>
                    <p className="text-xl font-bold text-gray-900">{latestMental.energyLevel}/5</p>
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Meditation</p>
                  <p className="text-xl font-bold text-purple-700">{latestMental.meditationMinutes || 0} min</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No mental health data yet</p>
                <p className="text-sm text-gray-400">Start tracking to see your progress</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals Progress */}
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
              {goals.length > 3 && (
                <p className="text-sm text-gray-500 text-center">+{goals.length - 3} more goals</p>
              )}
            </div>
          ) : (userProfile.goals || []).length > 0 ? (
            <div className="space-y-4">
              {(userProfile.goals || []).slice(0, 3).map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{goal}</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              ))}
              {(userProfile.goals || []).length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{(userProfile.goals || []).length - 3} more goals
                </p>
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
