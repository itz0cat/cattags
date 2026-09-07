import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamDirectoryPage } from './pages/TeamDirectoryPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamCreatePage } from './pages/TeamCreatePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { DocsPage } from './pages/DocsPage';
import { VerifyPage } from './pages/VerifyPage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Protected Route Guard
function ProtectedRoute({
  user,
  children,
  requireAdmin = false
}: {
  user: any;
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const location = useLocation();

  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public-Only Route Guard (blocks authenticated users from seeing login/register)
function PublicOnlyRoute({ user, children }: { user: any; children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (user) {
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

// Team Detail URL Param Wrapper
function TeamDetailWrapper({ user, onNavigate }: { user: any; onNavigate: (tab: string, id?: string) => void }) {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <Navigate to="/teams" replace />;
  }
  return <TeamDetailPage teamId={id} user={user} onNavigate={onNavigate} />;
}

// My Team Auto-Locator Redirect
function MyTeamRedirect({ user, team }: { user: any; team: any }) {
  if (!user) {
    return <Navigate to="/login?redirect=/my-team" replace />;
  }
  if (team && team.id) {
    return <Navigate to={`/teams/${team.id}`} replace />;
  }
  return <Navigate to="/teams/create" replace />;
}

// Catch-All 404 Page
function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#172033] border border-[#1F2937] text-[#3B82F6] font-black text-2xl mb-2">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-[#F9FAFB]">Page Not Found</h1>
      <p className="text-sm text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
        The route you are trying to visit does not exist or has moved.
      </p>
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors"
        >
          Return Home
        </Link>
        <Link
          to="/teams"
          className="px-5 py-2.5 rounded-lg bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-[#D1D5DB] font-medium text-sm transition-colors"
        >
          Browse Teams
        </Link>
      </div>
    </div>
  );
}

export function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('cattags_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [team, setTeam] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('cattags_team');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  // Sync authentication & team state with Better Auth session cookie
  const syncSession = async () => {
    try {
      const token = localStorage.getItem('cattags_token');
      const res = await fetch('/api/v1/auth/me', {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('cattags_token', data.token);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('cattags_user', JSON.stringify(data.user));
          if (data.team) {
            setTeam(data.team);
            localStorage.setItem('cattags_team', JSON.stringify(data.team));
          } else {
            setTeam(null);
            localStorage.removeItem('cattags_team');
          }
        }
      } else if (res.status === 401) {
        setUser(null);
        setTeam(null);
        localStorage.removeItem('cattags_user');
        localStorage.removeItem('cattags_team');
        localStorage.removeItem('cattags_token');
      }
    } catch {
      // offline fallback to cached state
    }
  };

  useEffect(() => {
    syncSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});
    } finally {
      setUser(null);
      setTeam(null);
      localStorage.removeItem('cattags_user');
      localStorage.removeItem('cattags_team');
      localStorage.removeItem('cattags_token');
      navigate('/');
    }
  };

  const handleNavigate = (tab: string, teamId?: string) => {
    if (tab === 'team-detail' && teamId) {
      navigate(`/teams/${teamId}`);
    } else if (tab === 'teams') {
      navigate('/teams');
    } else if (tab === 'create-team') {
      navigate('/teams/create');
    } else if (tab === 'dashboard') {
      navigate('/dashboard');
    } else if (tab === 'my-team') {
      navigate('/my-team');
    } else if (tab === 'verify') {
      navigate('/verify');
    } else if (tab === 'docs') {
      navigate('/docs');
    } else if (tab === 'settings') {
      navigate('/settings');
    } else if (tab === 'login') {
      navigate('/login');
    } else if (tab === 'register') {
      navigate('/register');
    } else if (tab === 'admin') {
      navigate('/admin');
    } else if (tab === 'home' || tab === '/') {
      navigate('/');
    } else if (tab.startsWith('/')) {
      navigate(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F9FAFB] flex flex-col overflow-x-hidden">
      <Navbar user={user} team={team} onLogout={handleLogout} />

      <main className="flex-1">
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/home" element={<HomePage onNavigate={handleNavigate} />} />

          {/* Docs & Setup Guide */}
          <Route path="/docs" element={<DocsPage />} />

          {/* Verification Portal (redeem code) */}
          <Route path="/verify" element={<VerifyPage />} />

          {/* Public Team Directory */}
          <Route path="/teams" element={<TeamDirectoryPage onNavigate={handleNavigate} />} />

          {/* Team Detail by ID */}
          <Route
            path="/teams/:id"
            element={<TeamDetailWrapper user={user} onNavigate={handleNavigate} />}
          />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <DashboardPage user={user} onNavigate={handleNavigate} />
              </ProtectedRoute>
            }
          />

          {/* Protected My Team route */}
          <Route
            path="/my-team"
            element={
              <ProtectedRoute user={user}>
                <MyTeamRedirect user={user} team={team} />
              </ProtectedRoute>
            }
          />

          {/* Protected Team Registration */}
          <Route
            path="/teams/create"
            element={
              <ProtectedRoute user={user}>
                <TeamCreatePage onNavigate={handleNavigate} team={team} />
              </ProtectedRoute>
            }
          />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute user={user}>
                <SettingsPage
                  user={user}
                  onUserUpdate={(updatedUser) => {
                    setUser(updatedUser);
                    localStorage.setItem('cattags_user', JSON.stringify(updatedUser));
                    syncSession();
                  }}
                />
              </ProtectedRoute>
            }
          />

          {/* Public-Only Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute user={user}>
                <LoginPage onNavigate={handleNavigate} />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute user={user}>
                <RegisterPage onNavigate={handleNavigate} />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2937] bg-[#080B12] py-8 text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#F9FAFB] text-sm">CatTags</span>
              <span>— Persistent team identity for Minecraft Java 1.21.11 Fabric.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <Link to="/" className="hover:text-[#F9FAFB] transition-colors">
                Home
              </Link>
              <Link to="/teams" className="hover:text-[#F9FAFB] transition-colors">
                Directory
              </Link>
              <Link to="/docs" className="hover:text-[#F9FAFB] transition-colors">
                Docs
              </Link>
              <Link to="/verify" className="hover:text-[#F9FAFB] transition-colors">
                Verify
              </Link>
              <Link to="/terms" className="hover:text-[#F9FAFB] transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-[#F9FAFB] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/teams/create" className="hover:text-[#F9FAFB] transition-colors">
                Register Team
              </Link>
              <a
                href="https://github.com/itz0cat/cattags"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#F9FAFB] transition-colors"
              >
                GitHub
              </a>
              <a
                href="/api/v1/health"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#F9FAFB] transition-colors"
              >
                API Health
              </a>
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
