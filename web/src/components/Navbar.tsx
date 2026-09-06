import React from 'react';
import { Shield, Users, PlusCircle, LogIn, LogOut, Terminal } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  return (
    <header className="border-b border-[#1F2937] bg-[#080B12]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1F2937] flex items-center justify-center group-hover:border-[#3B82F6] transition-colors">
            <img src="/icon.png" alt="CatTags" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              CatTags
            </span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-[#172033] text-[#60A5FA] border border-[#1F2937]">
              1.21.11
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'home' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'dashboard' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('teams')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'teams' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setCurrentTab('create-team')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'create-team' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            New Team
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'admin' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            System
          </button>
        </nav>

        {/* User / Auth */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-[#D1D5DB] font-medium hidden sm:inline">
                {user.minecraftUsername || user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-[#172033] hover:bg-[#1F2937] text-[#EF4444] border border-[#1F2937] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentTab('login')}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#111827] hover:bg-[#172033] text-[#D1D5DB] border border-[#1F2937] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setCurrentTab('register')}
                className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] hover:bg-[#1D4ED8] text-white shadow-sm transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
