import React, { useState } from 'react';
import { User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { UserProfile } from '@/types/health';

interface ProfileSetupProps {
  onSave: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave, existingProfile }) => {
  const [profile, setProfile] = useState({
    name: existingProfile?.name || '',
    age: existingProfile?.age?.toString() || '',
    gender: existingProfile?.gender || '',
    height: existingProfile?.height?.toString() || '',
    weight: existingProfile?.weight?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userProfile: UserProfile = {
      id: existingProfile?.id || uuidv4(),
      name: profile.name,
      age: parseInt(profile.age),
      gender: profile.gender as UserProfile['gender'],
      height: parseFloat(profile.height),
      weight: parseFloat(profile.weight),
      goals: existingProfile?.goals || [],
      createdAt: existingProfile?.createdAt || new Date(),
    };
    onSave(userProfile);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {existingProfile ? 'Edit Profile' : 'Set Up Your Profile'}
          </h2>
          <p className="text-gray-600">
            {existingProfile ? 'Update your personal information' : 'Let\'s get to know you better to personalize your health dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input type="text" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" placeholder="Enter your full name" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input type="number" required min="1" max="120" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} className="input-field" placeholder="Your age" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select required value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="input-field">
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm) *</label>
              <input type="number" required min="50" max="250" step="0.1" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} className="input-field" placeholder="e.g., 170" />
            </div>
            <div>
              <label className="block text.sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
              <input type="number" required min="20" max="300" step="0.1" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} className="input-field" placeholder="e.g., 70" />
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" className="btn-primary w-full">{existingProfile ? 'Update Profile' : 'Create Profile'}</button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">All information is stored locally on your device and is not shared with anyone.</p>
        </div>
      </div>
    </div>
  );
};
