import React, { useState } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { TeamStyle } from '@cattags/shared';

interface TeamCreatePageProps {
  onNavigate: (tab: string, teamId?: string) => void;
}

export const TeamCreatePage: React.FC<TeamCreatePageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [prefix, setPrefix] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#06B6D4');
  const [isGradient, setIsGradient] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!name || !prefix || !slug) {
      alert('Please fill out all required fields');
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          slug,
          prefix,
          description,
          primaryColor,
          secondaryColor: isGradient ? secondaryColor : null,
          gradientEnabled: isGradient,
          style,
          turnstileToken
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const data = await res.json();
      alert('Team created successfully!');
      onNavigate('team-detail', data.team.id);
    } catch (err: any) {
      alert(err.message || 'Error creating team');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Nova Esports"
              className="w-full px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#F9FAFB] focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="nova"
                className="w-full px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#F9FAFB] focus:border-[#3B82F6] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Prefix (Max 10) *</label>
              <input
                type="text"
                required
                maxLength={10}
                value={prefix}
                onChange={e => setPrefix(e.target.value.toUpperCase())}
                placeholder="NOVA"
                className="w-full px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#F9FAFB] focus:border-[#3B82F6] focus:outline-none font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief overview of your team..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#F9FAFB] focus:border-[#3B82F6] focus:outline-none"
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

          <TurnstileWidget onSuccess={token => setTurnstileToken(token)} />

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
