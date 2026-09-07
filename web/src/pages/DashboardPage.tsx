import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, ShieldCheck, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';

interface DashboardPageProps {
  user: any;
  onNavigate: (tab: string, teamId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/teams');
      if (!res.ok) throw new Error('Failed to load teams');
      const data = await res.json();
      if (data.teams) {
        if (user) {
          const userTeams = data.teams.filter(
            (t: any) => t.ownerId === user.id || t.owner_id === user.id
          );
          setTeams(userTeams);
        } else {
          setTeams([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Team Management Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            {user ? `Logged in as ${user.minecraftUsername || user.email}` : 'Sign in to manage your official Minecraft teams and rosters'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/itz0cat/cattags/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Mod (.jar)</span>
          </a>
          {user && (
            <button
              onClick={() => onNavigate('create-team')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center text-sm text-[#9CA3AF]">
          <div className="inline-block w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading teams...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 text-center space-y-3">
          <p className="text-sm text-[#EF4444] font-medium">{error}</p>
          <button
            onClick={fetchTeams}
            className="px-4 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#F9FAFB] hover:border-[#3B82F6] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Not Logged In State */}
      {!loading && !error && !user && (
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#172033] border border-[#1F2937] text-[#3B82F6] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F9FAFB]">Account Required</h2>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Please sign in or create an account to view and customize your Minecraft teams.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-5 py-2.5 rounded-lg bg-[#172033] hover:bg-[#1E293B] border border-[#1F2937] text-[#D1D5DB] font-medium text-sm transition-colors"
            >
              Register
            </button>
            <button
              onClick={() => onNavigate('teams')}
              className="px-5 py-2.5 rounded-lg bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-[#9CA3AF] font-medium text-sm transition-colors"
            >
              Browse Directory
            </button>
          </div>
        </div>
      )}

      {/* Empty State (Logged in with 0 teams) */}
      {!loading && !error && user && teams.length === 0 && (
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#172033] border border-[#1F2937] text-[#60A5FA] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F9FAFB]">No Teams Registered Yet</h2>
            <p className="text-sm text-[#9CA3AF] mt-1">
              You haven't registered any Minecraft teams under this account. Create your team identity to display custom tags in-game.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create-team')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Your First Team</span>
          </button>
        </div>
      )}

      {/* Team Cards Grid (Real User Teams) */}
      {!loading && !error && user && teams.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map(team => (
            <div
              key={team.id}
              className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 space-y-6 hover:border-[#3B82F6]/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-[#F9FAFB]">{team.name}</h2>
                    {team.verified && (
                      <span className="flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#9CA3AF] font-mono mt-0.5 block">
                    Slug: {team.slug} • Version: {team.version}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('team-detail', team.id)}
                  className="p-2 rounded-lg bg-[#172033] hover:bg-[#1F2937] text-[#60A5FA] border border-[#1F2937] transition-colors"
                  title="Edit Team"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* In-Game Preview Box */}
              <MinecraftTagPreview
                prefix={team.prefix}
                style={team.style || { type: 'SOLID', colors: [team.primaryColor || '#3B82F6'] }}
                logoUrl={team.logoUrl}
                playerName={user?.minecraftUsername || 'Steve'}
              />

              {/* Quick Stats & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1F2937] text-sm text-[#9CA3AF]">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-[#3B82F6]" />
                  <span>{team.members?.length || 1} Members</span>
                </div>
                <button
                  onClick={() => onNavigate('team-detail', team.id)}
                  className="text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] flex items-center space-x-1"
                >
                  <span>Manage Appearance & Members</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
