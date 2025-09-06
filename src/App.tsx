import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AddHealthData } from './components/forms/AddHealthData';
import { ProfileSetup } from './components/forms/ProfileSetup';
import { storage } from './utils/storage';
import type { UserProfile, PhysicalHealthData, MentalHealthData, Goal } from './types/health';
import './index.css';
import { PhysicalSection } from './components/sections/PhysicalSection';
import { MentalSection } from './components/sections/MentalSection';
import { GoalsSection } from './components/sections/GoalsSection';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddData, setShowAddData] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [physicalData, setPhysicalData] = useState<PhysicalHealthData[]>([]);
  const [mentalData, setMentalData] = useState<MentalHealthData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load data on component mount
  useEffect(() => {
    const profile = storage.getUserProfile();
    const physical = storage.getPhysicalHealthData();
    const mental = storage.getMentalHealthData();

    setUserProfile(profile);
    setPhysicalData(physical);
    setMentalData(mental);

    // Load goals filtered by user
    const allGoals = storage.getGoals();
    const userGoals = profile ? allGoals.filter(g => g.userId === profile.id) : [];
    setGoals(userGoals);

    // If no profile exists, show profile setup
    if (!profile) {
      setActiveTab('profile');
    }
  }, []);

  const handleSaveProfile = (profile: UserProfile) => {
    storage.saveUserProfile(profile);
    setUserProfile(profile);
    // Load goals for this user on save
    const allGoals = storage.getGoals();
    setGoals(allGoals.filter(g => g.userId === profile.id));
    setActiveTab('dashboard');
  };

  const handleSavePhysicalData = (data: PhysicalHealthData) => {
    storage.addPhysicalHealthEntry(data);
    // Update in-memory state immediately
    setPhysicalData((prev) => [...prev, data]);
  };

  const handleSaveMentalData = (data: MentalHealthData) => {
    storage.addMentalHealthEntry(data);
    // Update in-memory state immediately
    setMentalData((prev) => [...prev, data]);
  };

  const handleAddGoal = (title: string) => {
    if (!userProfile) return;
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      userId: userProfile.id,
      title,
      description: '',
      category: 'both',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      targetDate: new Date(),
      completed: false,
      createdAt: new Date(),
    };
    storage.addGoal(newGoal);
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleToggleGoal = (goalId: string, completed: boolean) => {
    const updated = goals.map(g => (g.id === goalId ? { ...g, completed } : g));
    const changed = updated.find(g => g.id === goalId);
    if (changed) {
      storage.updateGoal(changed);
    }
    setGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    storage.deleteGoal(goalId);
    setGoals((prev) => prev.filter(g => g.id !== goalId));
  };

  // Don't show header if user hasn't set up profile yet
  const showMainInterface = userProfile !== null;

  if (!showMainInterface && activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <ProfileSetup onSave={handleSaveProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showMainInterface && (
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddData={() => setShowAddData(true)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            userProfile={userProfile}
            physicalData={physicalData}
            mentalData={mentalData}
            goals={goals}
          />
        )}

        {activeTab === 'physical' && (
          <PhysicalSection data={physicalData} />
        )}

        {activeTab === 'mental' && (
          <MentalSection data={mentalData} />
        )}

        {activeTab === 'goals' && (
          <GoalsSection
            goals={goals}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoal={(g) => { storage.updateGoal(g); setGoals((prev) => prev.map(x => x.id === g.id ? g : x)); }}
          />
        )}

        {activeTab === 'profile' && userProfile && (
          <ProfileSetup
            onSave={handleSaveProfile}
            existingProfile={userProfile}
          />
        )}
      </main>

      {/* Add Data Modal */}
      {showAddData && userProfile && (
        <AddHealthData
          onClose={() => setShowAddData(false)}
          onSavePhysical={handleSavePhysicalData}
          onSaveMental={handleSaveMentalData}
          userId={userProfile.id}
        />
      )}
    </div>
  );
}

export default App;
