import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';

interface DashboardPageProps {
  user: any;
  onNavigate: (tab: string, teamId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/v1/teams');
      const data = await res.json();
      if (data.teams) {
        // Filter teams owned by current user if logged in, or show first team
        if (user) {
          const userTeams = data.teams.filter((t: any) => t.ownerId === user.id);
          setTeams(userTeams.length > 0 ? userTeams : data.teams.slice(0, 1));
        } else {
          setTeams(data.teams.slice(0, 2));
        }
      }
    } catch {
      // Offline fallback mock data
      setTeams([
        {
          id: 'team_demo',
          name: 'Nova Team',
          slug: 'nova',
          prefix: 'NOVA',
          description: 'Official CatTags Nova demo team',
          primaryColor: '#3B82F6',
          secondaryColor: '#06B6D4',
          gradientEnabled: true,
          style: {
            type: 'GRADIENT',
            colors: ['#3B82F6', '#06B6D4'],
            direction: 'LEFT_TO_RIGHT',
            bold: true,
            italic: false
          },
          verified: true,
          version: 1,
          members: [
            { id: 'm1', minecraftUsername: 'Steve', role: 'OWNER', verified: true },
            { id: 'm2', minecraftUsername: 'Alex', role: 'MEMBER', verified: true }
          ]
        }
      ]);
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
            {user ? `Logged in as ${user.minecraftUsername || user.email}` : 'Demo View - Log in to manage your registered teams'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('create-team')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Team Cards Grid */}
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
    </div>
  );
};
