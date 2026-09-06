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
function MyTeamRedirect({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTarget('/login?redirect=/my-team');
      setLoading(false);
      return;
    }

    let active = true;
    fetch('/api/v1/teams')
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const myTeam = data.teams?.find(
          (t: any) => t.ownerId === user.id || t.owner_id === user.id
        );
        if (myTeam) {
          setTarget(`/teams/${myTeam.id}`);
        } else {
          setTarget('/teams/create');
        }
      })
      .catch(() => {
        if (active) setTarget('/dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-[#9CA3AF]">
        <div className="inline-block w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-3" />
        <p>Locating your team...</p>
      </div>
    );
  }

  return <Navigate to={target || '/dashboard'} replace />;
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
          to="/home"
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
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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

    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect') || '/dashboard';
    navigate(redirect);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cattags_user');
    localStorage.removeItem('cattags_token');
    navigate('/login');
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
    } else if (tab === 'login') {
      navigate('/login');
    } else if (tab === 'register') {
      navigate('/register');
    } else if (tab === 'admin') {
      navigate('/admin');
    } else if (tab === 'home') {
      navigate('/home');
    } else if (tab.startsWith('/')) {
      navigate(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F9FAFB] flex flex-col overflow-x-hidden">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <Routes>
          {/* Root Route: Redirect unauthenticated fresh visits to /login; authenticated visits to /dashboard */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />

          {/* Marketing / Home page */}
          <Route path="/home" element={<HomePage onNavigate={handleNavigate} />} />

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
                <MyTeamRedirect user={user} />
              </ProtectedRoute>
            }
          />

          {/* Public Team Directory */}
          <Route path="/teams" element={<TeamDirectoryPage onNavigate={handleNavigate} />} />

          {/* Protected Team Registration */}
          <Route
            path="/teams/create"
            element={
              <ProtectedRoute user={user}>
                <TeamCreatePage onNavigate={handleNavigate} />
              </ProtectedRoute>
            }
          />

          {/* Team Detail by ID */}
          <Route
            path="/teams/:id"
            element={<TeamDetailWrapper user={user} onNavigate={handleNavigate} />}
          />

          {/* Public-Only Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute user={user}>
                <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute user={user}>
                <RegisterPage onRegisterSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Admin/System Route */}
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
              <Link to="/home" className="hover:text-[#F9FAFB] transition-colors">
                Home
              </Link>
              <Link to="/teams" className="hover:text-[#F9FAFB] transition-colors">
                Directory
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
              <a href="mailto:support@cattags.xyz" className="hover:text-[#F9FAFB] transition-colors">
                Support
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
