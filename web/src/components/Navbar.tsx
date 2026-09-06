import React, { useState } from 'react';
import { Shield, Users, PlusCircle, LogIn, LogOut, Terminal, Menu, X, Flag } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, user, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="border-b border-[#1F2937] bg-[#080B12]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => handleNav('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => handleNav('home')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'home' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'dashboard' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('my-team')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'my-team' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            <span>My Team</span>
          </button>
          <button
            onClick={() => handleNav('teams')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'teams' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => handleNav('create-team')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'create-team' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <PlusCircle className="w-4 h-4 mr-0.5" />
            <span>New Team</span>
          </button>
          <button
            onClick={() => handleNav('admin')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'admin' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            System
          </button>
        </nav>

        {/* Desktop User / Auth */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-[#D1D5DB] font-medium">
                {user.minecraftUsername || user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-[#172033] hover:bg-[#1F2937] text-[#EF4444] border border-[#1F2937] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNav('login')}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#111827] hover:bg-[#172033] text-[#D1D5DB] border border-[#1F2937] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('register')}
                className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] hover:bg-[#1D4ED8] text-white shadow-sm transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <span className="text-xs text-[#9CA3AF] max-w-[100px] truncate">
              {user.minecraftUsername || user.email?.split('@')[0]}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-[#111827] border border-[#1F2937] text-[#D1D5DB] hover:text-[#F9FAFB] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#080B12] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
              currentTab === 'home' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <span>Home</span>
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
              currentTab === 'dashboard' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNav('my-team')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
              currentTab === 'my-team' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            <span>My Team</span>
          </button>
          <button
            onClick={() => handleNav('teams')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
              currentTab === 'teams' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <span>Teams Directory</span>
          </button>
          <button
            onClick={() => handleNav('create-team')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
              currentTab === 'create-team' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#3B82F6]" />
            <span>Register New Team</span>
          </button>
          <button
            onClick={() => handleNav('admin')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
              currentTab === 'admin' ? 'text-[#3B82F6] bg-[#172033]' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#9CA3AF]" />
            <span>System Health</span>
          </button>

          {/* Auth in Mobile Drawer */}
          <div className="pt-3 border-t border-[#1F2937] flex items-center gap-2">
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium bg-[#172033] text-[#EF4444] border border-[#1F2937]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.minecraftUsername || user.email?.split('@')[0]})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNav('login')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#111827] text-[#D1D5DB] border border-[#1F2937]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#3B82F6] text-white"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
