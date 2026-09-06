import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { TurnstileWidget } from '../components/TurnstileWidget';

interface RegisterPageProps {
  onRegisterSuccess: (user: any, token: string) => void;
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, minecraftUsername, turnstileToken })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      onRegisterSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#F9FAFB]">Create an Account</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">Start managing your team identity</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-[#EF4444]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Minecraft Username</label>
            <input
              type="text"
              required
              placeholder="e.g. Steve"
              value={minecraftUsername}
              onChange={e => setMinecraftUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Password (min. 8 characters)</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#080B12] border border-[#1F2937] text-base sm:text-sm text-[#F9FAFB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          <TurnstileWidget onSuccess={token => setTurnstileToken(token)} />

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium text-sm transition-colors flex items-center justify-center space-x-2 focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#9CA3AF]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#3B82F6] hover:text-[#60A5FA] font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
