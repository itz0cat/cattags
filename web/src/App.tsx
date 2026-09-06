import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamDirectoryPage } from './pages/TeamDirectoryPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamCreatePage } from './pages/TeamCreatePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cattags_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cattags_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('cattags_user', JSON.stringify(userData));
    localStorage.setItem('cattags_token', token);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cattags_user');
    localStorage.removeItem('cattags_token');
    setCurrentTab('home');
  };

  const handleNavigate = async (tab: string, teamId?: string) => {
    if (tab === 'my-team') {
      if (!user) {
        setCurrentTab('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      try {
        const res = await fetch('/api/v1/teams');
        const data = await res.json();
        const myTeam = data.teams?.find(
          (t: any) => t.ownerId === user.id || t.owner_id === user.id
        );
        if (myTeam) {
          setSelectedTeamId(myTeam.id);
          setCurrentTab('team-detail');
        } else {
          setCurrentTab('create-team');
        }
      } catch {
        setCurrentTab('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (teamId) {
      setSelectedTeamId(teamId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const knownTabs = ['home', 'dashboard', 'teams', 'team-detail', 'create-team', 'login', 'register', 'admin', 'my-team'];
  const isKnownTab = knownTabs.includes(currentTab);

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F9FAFB] flex flex-col overflow-x-hidden">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentTab === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentTab === 'dashboard' && <DashboardPage user={user} onNavigate={handleNavigate} />}
        {currentTab === 'teams' && <TeamDirectoryPage onNavigate={handleNavigate} />}
        {currentTab === 'team-detail' && selectedTeamId && (
          <TeamDetailPage teamId={selectedTeamId} user={user} onNavigate={handleNavigate} />
        )}
        {currentTab === 'create-team' && <TeamCreatePage onNavigate={handleNavigate} />}
        {currentTab === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        )}
        {currentTab === 'register' && (
          <RegisterPage onRegisterSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        )}
        {currentTab === 'admin' && <AdminPage />}

        {!isKnownTab && (
          <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
            <h1 className="text-6xl font-black text-[#3B82F6]">404</h1>
            <h2 className="text-xl font-bold text-[#F9FAFB]">Page Not Found</h2>
            <p className="text-sm text-[#9CA3AF]">
              The page or team view you are trying to reach does not exist.
            </p>
            <button
              onClick={() => handleNavigate('home')}
              className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors inline-block"
            >
              Return Home
            </button>
          </div>
        )}
      </main>

      {/* Modern Polish Footer */}
      <footer className="border-t border-[#1F2937] bg-[#080B12] py-8 text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#F9FAFB] text-sm">CatTags</span>
              <span>— Persistent team identity for Minecraft Java 1.21.11 Fabric.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button onClick={() => handleNavigate('home')} className="hover:text-[#F9FAFB] transition-colors">Home</button>
              <button onClick={() => handleNavigate('teams')} className="hover:text-[#F9FAFB] transition-colors">Directory</button>
              <button onClick={() => handleNavigate('create-team')} className="hover:text-[#F9FAFB] transition-colors">Register Team</button>
              <a href="https://github.com/itz0cat/cattags" target="_blank" rel="noreferrer" className="hover:text-[#F9FAFB] transition-colors">GitHub</a>
              <a href="/api/v1/health" target="_blank" rel="noreferrer" className="hover:text-[#F9FAFB] transition-colors">API Health</a>
              <a href="mailto:itz0cat@outlook.com" className="hover:text-[#F9FAFB] transition-colors">Support</a>
            </div>
          </div>
          <div className="pt-4 border-t border-[#1F2937]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6B7280]">
            <div>&copy; {new Date().getFullYear()} CatTags. All rights reserved. Built by ItzCat.</div>
            <div>Zero-Crash Guarantee &bull; High Performance LRU Disk Caching</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
