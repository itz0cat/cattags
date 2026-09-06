import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { TurnstileWidget } from '../components/TurnstileWidget';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#F9FAFB]">Sign in to CatTags</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">Manage your Minecraft team identities</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-[#EF4444]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#080B12] border border-[#1F2937] text-sm text-[#F9FAFB] focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#080B12] border border-[#1F2937] text-sm text-[#F9FAFB] focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          <TurnstileWidget onSuccess={token => setTurnstileToken(token)} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#9CA3AF]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#3B82F6] hover:text-[#60A5FA] font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
