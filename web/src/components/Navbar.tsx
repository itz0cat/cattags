import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Settings, LogOut, CheckCircle, Menu, X, ChevronDown, BookOpen, Users, LayoutDashboard, Download } from 'lucide-react';
import { DiscordIcon } from '../pages/LoginPage';

interface NavbarProps {
  user: any;
  team?: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, team, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const isCurrent = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isCurrent(path)
        ? 'text-[#3B82F6] bg-[#172033]'
        : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
    }`;

  const mobileLinkClass = (path: string) =>
    `w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center space-x-3 transition-colors min-h-[44px] ${
      isCurrent(path)
        ? 'text-[#3B82F6] bg-[#172033]'
        : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#111827]'
    }`;

  const initials = (user?.minecraftUsername || user?.name || user?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  const handleDiscordClick = async () => {
    try {
      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'discord', callbackURL: '/dashboard' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <header className="border-b border-[#1F2937] bg-[#080B12]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Navigation Links */}
        <div className="flex items-center space-x-6">
          {/* Logo + Wordmark */}
          <Link
            to="/"
            className="flex items-center space-x-3 cursor-pointer group select-none focus:outline-none"
            aria-label="CatTags Home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-center group-hover:border-[#3B82F6] transition-colors shadow-inner">
              <img src="/icon.png" alt="CatTags" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
                CatTags
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#172033] text-[#60A5FA] border border-[#1F2937]">
                1.21.11
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Always visible */}
            <Link to="/teams" className={linkClass('/teams')}>
              Teams
            </Link>
            <Link to="/docs" className={linkClass('/docs')}>
              Docs
            </Link>

            {/* Logged in only */}
            {user && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  Dashboard
                </Link>

                {/* My Team: Only visible if user belongs to/owns a team */}
                {team && (
                  <Link
                    to={`/teams/${team.id}`}
                    className={`flex items-center space-x-1.5 ${linkClass(`/teams/${team.id}`)}`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>My Team</span>
                  </Link>
                )}

                <Link to="/verify" className={linkClass('/verify')}>
                  Verify
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right: Auth / Profile Area */}
        <div className="hidden md:flex items-center space-x-3">
          <a
            href="https://github.com/itz0cat/cattags/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-xs font-semibold text-[#22C55E] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Mod</span>
          </a>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-[#111827] border border-transparent hover:border-[#1F2937] transition-colors focus:outline-none cursor-pointer"
                aria-label="User menu"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.minecraftUsername || user.email}
                    className="w-9 h-9 rounded-full object-cover border border-[#1F2937]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#172033] border border-[#3B82F6]/50 text-xs font-bold text-[#60A5FA] flex items-center justify-center">
                    {initials}
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-[#1F2937]">
                    <p className="text-xs font-semibold text-[#F9FAFB] truncate">
                      {user.minecraftUsername || user.name || 'Minecraft Player'}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full px-4 py-2 text-xs text-[#D1D5DB] hover:text-[#F9FAFB] hover:bg-[#172033] flex items-center space-x-2.5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span>Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDiscordClick}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-xs font-semibold shadow-md shadow-[#3B82F6]/20 transition-all hover:scale-[1.02] cursor-pointer min-h-[40px]"
            >
              <DiscordIcon className="w-4 h-4 fill-current" />
              <span>Continue with Discord</span>
            </button>
          )}
        </div>

        {/* Mobile View: Avatar (if logged in) + Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <Link to="/settings" className="p-1" aria-label="Settings">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.minecraftUsername || user.email}
                  className="w-8 h-8 rounded-full object-cover border border-[#1F2937]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#172033] border border-[#3B82F6]/50 text-xs font-bold text-[#60A5FA] flex items-center justify-center">
                  {initials}
                </div>
              )}
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#D1D5DB] hover:text-[#F9FAFB] focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1F2937] bg-[#080B12] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {/* Always Visible */}
          <a
            href="https://github.com/itz0cat/cattags/releases/latest"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileOpen(false)}
            className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold flex items-center space-x-3 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4 text-[#22C55E]" />
            <span>Download Mod (.jar)</span>
          </a>

          <Link
            to="/teams"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/teams')}
          >
            <Users className="w-4 h-4 text-[#3B82F6]" />
            <span>Teams</span>
          </Link>

          <Link
            to="/docs"
            onClick={() => setMobileOpen(false)}
            className={mobileLinkClass('/docs')}
          >
            <BookOpen className="w-4 h-4 text-[#3B82F6]" />
            <span>Docs</span>
          </Link>

          {/* Logged in Only */}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 text-[#3B82F6]" />
                <span>Dashboard</span>
              </Link>

              {team && (
                <Link
                  to={`/teams/${team.id}`}
                  onClick={() => setMobileOpen(false)}
                  className={mobileLinkClass(`/teams/${team.id}`)}
                >
                  <Shield className="w-4 h-4 text-[#3B82F6]" />
                  <span>My Team ({team.name})</span>
                </Link>
              )}

              <Link
                to="/verify"
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass('/verify')}
              >
                <CheckCircle className="w-4 h-4 text-[#3B82F6]" />
                <span>Verify</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass('/settings')}
              >
                <Settings className="w-4 h-4 text-[#9CA3AF]" />
                <span>Settings</span>
              </Link>

              <div className="pt-3 border-t border-[#1F2937]">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium bg-[#172033] text-[#EF4444] border border-[#1F2937] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-[#1F2937]">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleDiscordClick();
                }}
                className="w-full min-h-[48px] flex items-center justify-center space-x-2.5 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md shadow-[#3B82F6]/20 cursor-pointer"
              >
                <DiscordIcon className="w-5 h-5 fill-current" />
                <span>Continue with Discord</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
