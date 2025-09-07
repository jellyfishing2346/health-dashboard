'use client'

import { Activity, Heart, Brain, Target, User, Settings, Bell, Search, Plus, LogIn, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddData: () => void;
}

export function Header({ activeTab, onTabChange, onAddData }: HeaderProps) {
  const { data: session, status } = useSession();
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'physical', label: 'Physical', icon: Heart },
    { id: 'mental', label: 'Mental', icon: Brain },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img
              src="/health-tracker.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded object-cover overflow-hidden"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">HealthTracker</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Your wellness companion</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            <button onClick={onAddData} className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Data</span>
            </button>
            <div className="hidden sm:flex items-center space-x-2">
              <button className="btn-ghost p-2" aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
              <button className="btn-ghost p-2" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <button className="btn-ghost p-2" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {status === 'authenticated' ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full overflow-hidden flex items-center justify-center">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="w-8 h-8 object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-primary-600" />
                  )}
                </div>
                <button onClick={() => signOut()} className="btn-ghost flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <button onClick={() => signIn('google')} className="btn-secondary flex items-center space-x-1">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
