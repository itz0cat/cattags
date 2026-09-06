import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, PlusCircle, LogOut, Terminal, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/home' || path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isCurrent(path)
        ? 'text-[#3B82F6] bg-[#172033]'
        : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
    }`;

  const mobileLinkClass = (path: string) =>
    `w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
      isCurrent(path)
        ? 'text-[#3B82F6] bg-[#172033]'
        : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
    }`;

  return (
    <header className="border-b border-[#1F2937] bg-[#080B12]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/home"
          className="flex items-center space-x-3 cursor-pointer group select-none focus:outline-none"
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
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/home" className={linkClass('/home')}>
            Home
          </Link>
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/my-team" className={`flex items-center space-x-1.5 ${linkClass('/my-team')}`}>
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            <span>My Team</span>
          </Link>
          <Link to="/teams" className={linkClass('/teams')}>
            Teams
          </Link>
          <Link to="/teams/create" className={`flex items-center space-x-1 ${linkClass('/teams/create')}`}>
            <PlusCircle className="w-4 h-4 mr-0.5" />
            <span>New Team</span>
          </Link>
          <Link to="/admin" className={linkClass('/admin')}>
            System
          </Link>
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
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#111827] hover:bg-[#172033] text-[#D1D5DB] border border-[#1F2937] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] hover:bg-[#1D4ED8] text-white shadow-sm transition-colors"
              >
                Register
              </Link>
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
            className="p-2 rounded-lg bg-[#111827] border border-[#1F2937] text-[#D1D5DB] hover:text-[#F9FAFB] focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#080B12] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/home"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/home')}
          >
            <span>Home</span>
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/dashboard')}
          >
            <span>Dashboard</span>
          </Link>
          <Link
            to="/my-team"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/my-team')}
          >
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            <span>My Team</span>
          </Link>
          <Link
            to="/teams"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/teams')}
          >
            <span>Teams Directory</span>
          </Link>
          <Link
            to="/teams/create"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/teams/create')}
          >
            <PlusCircle className="w-4 h-4 text-[#3B82F6]" />
            <span>Register New Team</span>
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/admin')}
          >
            <Terminal className="w-4 h-4 text-[#9CA3AF]" />
            <span>System Health</span>
          </Link>

          {/* Auth in Mobile Drawer */}
          <div className="pt-3 border-t border-[#1F2937] flex items-center gap-2">
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileOpen(false);
                }}
                className="w-full min-h-[44px] flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium bg-[#172033] text-[#EF4444] border border-[#1F2937]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.minecraftUsername || user.email?.split('@')[0]})</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 min-h-[44px] flex items-center justify-center py-2.5 rounded-lg text-sm font-medium bg-[#111827] text-[#D1D5DB] border border-[#1F2937]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 min-h-[44px] flex items-center justify-center py-2.5 rounded-lg text-sm font-medium bg-[#3B82F6] text-white font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
