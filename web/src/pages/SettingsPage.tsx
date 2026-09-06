import React, { useState } from 'react';
import { User, Shield, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { DiscordIcon } from './LoginPage';

interface SettingsPageProps {
  user: any;
  onUserUpdate?: (updatedUser: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUserUpdate }) => {
  const [minecraftUsername, setMinecraftUsername] = useState(user?.minecraftUsername || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem('cattags_token');
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ minecraftUsername: minecraftUsername.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Minecraft username updated successfully!');
      if (onUserUpdate && data.user) {
        onUserUpdate(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#1F2937] pb-6">
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Account Settings</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Manage your Discord integration and linked Minecraft account identity
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-xs text-[#EF4444] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 text-xs text-[#22C55E] flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Profile Overview */}
        <div className="p-6 rounded-2xl border border-[#1F2937] bg-[#111827] space-y-4 text-center">
          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden bg-[#172033] border-2 border-[#3B82F6] flex items-center justify-center">
            {user?.image ? (
              <img src={user.image} alt={user.email} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-[#60A5FA]">
                {(user?.minecraftUsername || user?.email || 'U').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-[#F9FAFB]">{user?.name || user?.minecraftUsername || 'Player'}</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{user?.email}</p>
          </div>

          <div className="pt-2 border-t border-[#1F2937] flex items-center justify-center space-x-2 text-xs text-[#60A5FA]">
            <DiscordIcon className="w-4 h-4 fill-current" />
            <span>Discord Authenticated</span>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-[#1F2937] bg-[#111827] space-y-6">
          <h2 className="text-base font-bold text-[#F9FAFB] flex items-center space-x-2">
            <User className="w-4 h-4 text-[#3B82F6]" />
            <span>Minecraft Identity</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                In-Game Minecraft Username
              </label>
              <input
                type="text"
                value={minecraftUsername}
                onChange={e => setMinecraftUsername(e.target.value)}
                placeholder="e.g. Steve or Itz0Spy"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#6B7280] mt-1.5">
                This links your web account to your player tag so team membership can be verified in-game.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
