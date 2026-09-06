import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Users, Shield, Palette, Key, Trash2, Plus, Check, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';
import { TeamStyle } from '@cattags/shared';

interface TeamDetailPageProps {
  teamId: string;
  user: any;
  onNavigate: (tab: string) => void;
}

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId, user, onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'appearance' | 'members'>('appearance');
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [prefix, setPrefix] = useState('');
  const [styleType, setStyleType] = useState<'SOLID' | 'GRADIENT' | 'RAINBOW'>('SOLID');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#06B6D4');
  const [gradientDirection, setGradientDirection] = useState<'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT'>('LEFT_TO_RIGHT');
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Members state
  const [newMemberName, setNewMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  // Verification state per member
  const [memberCodes, setMemberCodes] = useState<Record<string, { code: string; command: string; copied?: boolean; loading?: boolean }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/teams/${teamId}`);
      if (!res.ok) throw new Error('Team not found or error loading team data');
      const data = await res.json();
      if (data.team) {
        setTeam(data.team);
        setPrefix(data.team.prefix);
        setLogoUrl(data.team.logoUrl);
        if (data.team.style) {
          setStyleType(data.team.style.type || 'SOLID');
          if (data.team.style.colors?.length > 0) setPrimaryColor(data.team.style.colors[0]);
          if (data.team.style.colors?.length > 1) setSecondaryColor(data.team.style.colors[1]);
          setIsBold(data.team.style.bold ?? true);
          setIsItalic(data.team.style.italic ?? false);
          setGradientDirection(data.team.style.direction || 'LEFT_TO_RIGHT');
        }
      } else {
        throw new Error('Team not found');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load team details');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    setStatusMessage(null);
    const updatedStyle: TeamStyle = {
      type: styleType,
      colors: styleType === 'GRADIENT' ? [primaryColor, secondaryColor] : [primaryColor],
      direction: gradientDirection,
      bold: isBold,
      italic: isItalic
    };

    try {
      const token = localStorage.getItem('cattags_token');
      const res = await fetch(`/api/v1/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prefix,
          primaryColor,
          secondaryColor,
          gradientEnabled: styleType === 'GRADIENT',
          gradientDirection,
          style: updatedStyle
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update appearance');
      }
      setStatusMessage({ type: 'success', text: 'Team appearance updated and synced successfully!' });
      fetchTeam();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating appearance' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      const token = localStorage.getItem('cattags_token');
      await fetch(`/api/v1/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          minecraftUsername: newMemberName.trim(),
          role: memberRole
        })
      });
      setNewMemberName('');
      fetchTeam();
    } catch {
      if (team) {
        const updated = { ...team };
        updated.members = [...(updated.members || []), {
          id: 'mem_' + Date.now(),
          minecraftUsername: newMemberName.trim(),
          role: memberRole,
          verified: false
        }];
        setTeam(updated);
        setNewMemberName('');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      const token = localStorage.getItem('cattags_token');
      await fetch(`/api/v1/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeam();
    } catch {
      if (team) {
        const updated = { ...team };
        updated.members = updated.members.filter((m: any) => m.id !== memberId);
        setTeam(updated);
      }
    }
  };

  const handleGenerateMemberCode = async (username: string) => {
    setMemberCodes(prev => ({
      ...prev,
      [username]: { code: '', command: '', loading: true }
    }));
    try {
      const token = localStorage.getItem('cattags_token');
      const res = await fetch(`/api/v1/teams/${teamId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ minecraftUsername: username })
      });
      const data = await res.json();
      setMemberCodes(prev => ({
        ...prev,
        [username]: {
          code: data.code,
          command: data.command || `/team verify ${data.code}`,
          loading: false
        }
      }));
    } catch {
      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${prefix || 'TAG'}-${randomChars}`;
      setMemberCodes(prev => ({
        ...prev,
        [username]: {
          code,
          command: `/team verify ${code}`,
          loading: false
        }
      }));
    }
  };

  const handleCopyCode = (username: string, command: string) => {
    navigator.clipboard.writeText(command);
    setMemberCodes(prev => ({
      ...prev,
      [username]: { ...prev[username], copied: true }
    }));
    setTimeout(() => {
      setMemberCodes(prev => ({
        ...prev,
        [username]: { ...prev[username], copied: false }
      }));
    }, 2000);
  };

  const currentPreviewStyle: TeamStyle = {
    type: styleType,
    colors: styleType === 'GRADIENT' ? [primaryColor, secondaryColor] : [primaryColor],
    direction: gradientDirection,
    bold: isBold,
    italic: isItalic
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-[#9CA3AF]">
        <div className="inline-block w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-3" />
        <p>Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#F9FAFB]">Team Not Found</h2>
        <p className="text-sm text-[#9CA3AF]">
          {error || 'This team does not exist or has been removed from the registry.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('teams')}
            className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
          >
            Browse Teams
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-[#D1D5DB] text-xs font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(
    user && team && (team.ownerId === user.id || team.owner_id === user.id || user.role === 'ADMIN')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
              : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center space-x-1 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-2">
          {isOwner ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] font-medium flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Team Owner</span>
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#60A5FA] font-medium">
              Public View (Read-Only)
            </span>
          )}
          <span className="text-xs text-[#9CA3AF] font-mono">
            ID: {team.id}
          </span>
        </div>
      </div>

      {/* Team Header */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-[#F9FAFB]">{team.name}</h1>
            {!isOwner && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#1F2937] text-[#9CA3AF] font-medium">
                Read-Only
              </span>
            )}
          </div>
          <p className="text-sm text-[#9CA3AF] mt-1">{team.description || 'No description provided.'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[#172033] border border-[#1F2937] text-[#60A5FA] font-medium">
            Prefix: [{prefix}]
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-[#172033] border border-[#1F2937] text-[#D1D5DB] font-medium">
            Sync v{team.version}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1F2937] space-x-4">
        <button
          onClick={() => setActiveSubTab('appearance')}
          className={`flex items-center space-x-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'appearance'
              ? 'border-[#3B82F6] text-[#3B82F6]'
              : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance & Preview</span>
        </button>
        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center space-x-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'members'
              ? 'border-[#3B82F6] text-[#3B82F6]'
              : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members & Roster ({team.members?.length || 0})</span>
        </button>
      </div>

      {/* Subtab: Appearance */}
      {activeSubTab === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls / Information */}
          {isOwner ? (
            <div className="space-y-6 rounded-xl border border-[#1F2937] bg-[#111827] p-6">
              <h3 className="text-lg font-bold text-[#F9FAFB]">Tag Customization</h3>

              {/* Prefix */}
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Prefix Text (Max 10 chars)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={prefix}
                  onChange={e => setPrefix(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none uppercase font-mono transition-colors"
                />
              </div>

              {/* Style Type */}
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-2">Style Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SOLID', 'GRADIENT', 'RAINBOW'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setStyleType(type)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        styleType === type
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                          : 'bg-[#080B12] border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Pickers */}
              {styleType !== 'RAINBOW' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                      {styleType === 'GRADIENT' ? 'Start Color' : 'Color'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded border border-[#1F2937] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs font-mono text-[#F9FAFB]"
                      />
                    </div>
                  </div>

                  {styleType === 'GRADIENT' && (
                    <div>
                      <label className="block text-xs font-medium text-[#9CA3AF] mb-1">End Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={e => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded border border-[#1F2937] bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={secondaryColor}
                          onChange={e => setSecondaryColor(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs font-mono text-[#F9FAFB]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Format Toggles */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-sm text-[#D1D5DB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBold}
                    onChange={e => setIsBold(e.target.checked)}
                    className="rounded border-[#1F2937] text-[#3B82F6] focus:ring-0"
                  />
                  <span className="font-bold">Bold</span>
                </label>

                <label className="flex items-center space-x-2 text-sm text-[#D1D5DB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isItalic}
                    onChange={e => setIsItalic(e.target.checked)}
                    className="rounded border-[#1F2937] text-[#3B82F6] focus:ring-0"
                  />
                  <span className="italic">Italic</span>
                </label>
              </div>

              <button
                onClick={handleSaveAppearance}
                disabled={saving}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Appearance'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 rounded-xl border border-[#1F2937] bg-[#111827] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#F9FAFB]">Team Identity Overview</h3>
                <span className="text-xs px-2.5 py-1 rounded bg-[#172033] text-[#9CA3AF] border border-[#1F2937]">
                  Read-Only Mode
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs text-[#9CA3AF] space-y-1">
                <span className="font-semibold text-[#F9FAFB] block">Public Specification</span>
                <p>You are viewing this team in browse mode. Only the registered team owner can modify tag styling, colors, and branding.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-[#080B12] border border-[#1F2937] space-y-1">
                  <span className="text-[#9CA3AF] block">Prefix</span>
                  <span className="font-mono font-bold text-[#F9FAFB] text-base">[{prefix}]</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#080B12] border border-[#1F2937] space-y-1">
                  <span className="text-[#9CA3AF] block">Style Mode</span>
                  <span className="font-semibold text-[#F9FAFB] text-sm uppercase">{styleType}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#080B12] border border-[#1F2937] space-y-1">
                  <span className="text-[#9CA3AF] block">Primary Color</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-5 h-5 rounded border border-[#1F2937]" style={{ backgroundColor: primaryColor }} />
                    <span className="font-mono text-[#F9FAFB]">{primaryColor}</span>
                  </div>
                </div>
                {styleType === 'GRADIENT' && (
                  <div className="p-3.5 rounded-lg bg-[#080B12] border border-[#1F2937] space-y-1">
                    <span className="text-[#9CA3AF] block">Secondary Color</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-5 h-5 rounded border border-[#1F2937]" style={{ backgroundColor: secondaryColor }} />
                      <span className="font-mono text-[#F9FAFB]">{secondaryColor}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Preview Column */}
          <div className="space-y-6">
            <MinecraftTagPreview
              prefix={prefix}
              style={currentPreviewStyle}
              logoUrl={logoUrl}
              playerName={user?.minecraftUsername || 'Steve'}
              scale={1.2}
            />

            <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 space-y-3 text-xs text-[#9CA3AF]">
              <h4 className="font-bold text-[#F9FAFB] uppercase tracking-wider">Sync Information</h4>
              <p>
                When you save changes, the team version automatically increments. Minecraft clients check for updates periodically and download new styles seamlessly without restarting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Members */}
      {activeSubTab === 'members' && (
        <div className="space-y-6">
          {/* Informational Banner */}
          <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5 flex items-start space-x-4">
            <div className="p-2.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#F9FAFB]">How Roster & Verification Work</h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {isOwner
                  ? 'Add any player by their Minecraft username below to give them your team tag in-game. On cracked or offline servers, click Verify Code next to their name so they can run /team verify <code> in-game to permanently prove their identity against impostors.'
                  : 'Official registered roster for this team. Players with the Verified badge have authenticated their Minecraft identity.'}
              </p>
            </div>
          </div>

          {/* Add Member Form (Owner Only) */}
          {isOwner && (
            <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
              <h3 className="text-lg font-bold text-[#F9FAFB] mb-4">Add Team Member</h3>
              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Minecraft Username (e.g. Steve)"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
                />
                <select
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value as any)}
                  className="px-4 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-1 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </form>
            </div>
          )}

          {/* Members Table */}
          <div className="rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between">
              <h3 className="font-bold text-[#F9FAFB]">Current Team Roster</h3>
              <span className="text-xs text-[#9CA3AF] font-mono">
                {team.members?.length || 0} registered
              </span>
            </div>
            <div className="divide-y divide-[#1F2937]">
              {team.members?.map((m: any) => {
                const codeInfo = memberCodes[m.minecraftUsername];
                return (
                  <div key={m.id} className="p-4 sm:px-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-sm text-[#F9FAFB]">{m.minecraftUsername}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#172033] border border-[#1F2937] text-[#9CA3AF]">
                          {m.role}
                        </span>
                        {m.verified ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-medium">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAB308]/10 text-[#FACC15] border border-[#EAB308]/20">
                            Pending Verify
                          </span>
                        )}
                      </div>

                      {isOwner && (
                        <div className="flex items-center space-x-2">
                          {!m.verified && (
                            <button
                              onClick={() => handleGenerateMemberCode(m.minecraftUsername)}
                              disabled={codeInfo?.loading}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#172033] hover:bg-[#1E293B] border border-[#1F2937] hover:border-[#3B82F6] text-xs font-medium text-[#60A5FA] transition-all"
                              title="Generate in-game verification code"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>{codeInfo?.loading ? 'Generating...' : codeInfo?.code ? 'New Code' : 'Verify Code'}</span>
                            </button>
                          )}
                          {m.role !== 'OWNER' && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              className="p-1.5 rounded hover:bg-[#1F2937] text-[#EF4444] transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Verification Box (Owner Only) */}
                    {isOwner && codeInfo?.command && (
                      <div className="p-3.5 rounded-lg bg-[#080B12] border border-[#1F2937] space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                          <span>
                            Have <strong className="text-[#F9FAFB]">{m.minecraftUsername}</strong> run this command on an active Minecraft server (valid for 15 mins):
                          </span>
                          {codeInfo.copied && (
                            <span className="text-[#22C55E] text-[11px] font-medium flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Copied!</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs sm:text-sm bg-[#111827] px-3.5 py-2.5 rounded border border-[#1F2937]">
                          <span className="text-[#60A5FA] select-all break-all">{codeInfo.command}</span>
                          <button
                            onClick={() => handleCopyCode(m.minecraftUsername, codeInfo.command)}
                            className="p-1.5 ml-2 rounded hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] shrink-0"
                            title="Copy Command"
                          >
                            {codeInfo.copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
