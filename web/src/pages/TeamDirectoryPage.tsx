import React, { useState, useEffect } from 'react';
import { Search, Shield, Users, ArrowRight } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';

interface TeamDirectoryPageProps {
  onNavigate: (tab: string, teamId?: string) => void;
}

export const TeamDirectoryPage: React.FC<TeamDirectoryPageProps> = ({ onNavigate }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [search]);

  const fetchTeams = async () => {
    try {
      const url = search ? `/api/v1/teams?search=${encodeURIComponent(search)}` : '/api/v1/teams';
      const res = await fetch(url);
      const data = await res.json();
      setTeams(data.teams || []);
    } catch {
      setTeams([
        {
          id: 'team_1',
          name: 'Nova',
          slug: 'nova',
          prefix: 'NOVA',
          primaryColor: '#3B82F6',
          style: { type: 'GRADIENT', colors: ['#3B82F6', '#06B6D4'], bold: true }
        },
        {
          id: 'team_2',
          name: 'Void',
          slug: 'void',
          prefix: 'VOID',
          primaryColor: '#8B5CF6',
          style: { type: 'GRADIENT', colors: ['#8B5CF6', '#EC4899'], bold: true }
        },
        {
          id: 'team_3',
          name: 'Frost',
          slug: 'frost',
          prefix: 'FROST',
          primaryColor: '#67E8F9',
          style: { type: 'SOLID', colors: ['#67E8F9'], bold: true }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Registered Teams</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Explore all active Minecraft teams registered on CatTags
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teams by name or prefix..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(t => (
          <div
            key={t.id}
            onClick={() => onNavigate('team-detail', t.id)}
            className="cursor-pointer rounded-xl border border-[#1F2937] bg-[#111827] p-5 space-y-4 hover:border-[#3B82F6] transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#F9FAFB]">{t.name}</h3>
                <span className="text-xs text-[#9CA3AF]">/{t.slug}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-[#172033] text-[#60A5FA] border border-[#1F2937]">
                v{t.version || 1}
              </span>
            </div>

            <MinecraftTagPreview
              prefix={t.prefix}
              style={t.style || { type: 'SOLID', colors: [t.primaryColor || '#3B82F6'] }}
              logoUrl={t.logoUrl}
              playerName="Steve"
              scale={0.95}
            />

            <div className="flex items-center justify-between text-xs text-[#9CA3AF] pt-2 border-t border-[#1F2937]">
              <span>Click to view members & details</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
