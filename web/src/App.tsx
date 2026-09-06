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

  const handleNavigate = (tab: string, teamId?: string) => {
    if (teamId) {
      setSelectedTeamId(teamId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F9FAFB] flex flex-col">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2937] bg-[#080B12] py-8 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#F9FAFB]">CatTags</span>
            <span>— Team identity, everywhere.</span>
          </div>
          <div>
            Built by ItzCat • Designed for Minecraft Java 1.21.11 Fabric
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
