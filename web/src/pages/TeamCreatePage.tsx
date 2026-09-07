import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';
import { TeamStyle } from '@cattags/shared';

interface TeamCreatePageProps {
  onNavigate: (tab: string, teamId?: string) => void;
  team?: any;
}

export const TeamCreatePage: React.FC<TeamCreatePageProps> = ({ onNavigate, team }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [prefix, setPrefix] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#06B6D4');
  const [isGradient, setIsGradient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (team && team.id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB]">
          Team Limit Reached
        </h1>
        <p className="text-sm text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
          You are already a member or owner of <strong className="text-[#F9FAFB]">{team.name}</strong>.
          Under CatTags policy, players can only belong to <strong>one team at a time</strong>.
          To create a new team, you must first leave or delete your current team.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('team-detail', team.id)}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Manage {team.name}</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-lg bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-[#D1D5DB] font-medium text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
    }
    if (!prefix && val.length <= 10) {
      setPrefix(val.slice(0, 5).toUpperCase());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name || !prefix || !slug) {
      setError('Please fill out all required fields');
      return;
    }

    setLoading(true);
    const style: TeamStyle = {
      type: isGradient ? 'GRADIENT' : 'SOLID',
      colors: isGradient ? [primaryColor, secondaryColor] : [primaryColor],
      direction: 'LEFT_TO_RIGHT',
      bold: true,
      italic: false
    };

    try {
      const token = localStorage.getItem('cattags_token');
      const res = await fetch('/api/v1/teams', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && token !== 'null' && token !== 'undefined' ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name,
          slug,
          prefix,
          description,
          primaryColor,
          secondaryColor: isGradient ? secondaryColor : null,
          gradientEnabled: isGradient,
          style
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const data = await res.json();
      setSuccessMessage('Team identity registered successfully! Redirecting...');
      setTimeout(() => {
        onNavigate('team-detail', data.team.id);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error creating team');
    } finally {
      setLoading(false);
    }
  };

  const currentPreviewStyle: TeamStyle = {
    type: isGradient ? 'GRADIENT' : 'SOLID',
    colors: isGradient ? [primaryColor, secondaryColor] : [primaryColor],
    direction: 'LEFT_TO_RIGHT',
    bold: true,
    italic: false
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center space-x-1 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="border-b border-[#1F2937] pb-4">
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Register a New Team</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Create an official Minecraft team identity recognized across the community
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline hover:no-underline ml-2">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E]">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Team Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Nova Esports"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="nova"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none font-mono transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Prefix (Max 10) *</label>
              <input
                type="text"
                required
                maxLength={10}
                value={prefix}
                onChange={e => setPrefix(e.target.value.toUpperCase())}
                placeholder="NOVA"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none font-mono uppercase transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief overview of your team..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-[#D1D5DB] mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGradient}
                onChange={e => setIsGradient(e.target.checked)}
                className="rounded border-[#1F2937] text-[#3B82F6]"
              />
              <span>Enable Gradient Prefix</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-[#9CA3AF] block mb-1">Primary Color</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-full h-10 rounded border border-[#1F2937] bg-transparent cursor-pointer"
                />
              </div>
              {isGradient && (
                <div>
                  <span className="text-[11px] text-[#9CA3AF] block mb-1">Secondary Color</span>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-full h-10 rounded border border-[#1F2937] bg-transparent cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Register Team'}</span>
          </button>
        </form>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Live Preview</span>
          <MinecraftTagPreview
            prefix={prefix || 'NOVA'}
            style={currentPreviewStyle}
            playerName="Steve"
            scale={1.15}
          />
          <div className="p-4 rounded-xl border border-[#1F2937] bg-[#111827] text-xs text-[#9CA3AF] space-y-1">
            <span className="font-semibold text-[#F9FAFB] block">Brand Note</span>
            <p>
              Your team will be registered with a globally unique ID. Anyone who installs CatTags on Minecraft 1.21.11 Fabric will see this styled tag when looking at your team members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
