import React, { useState } from 'react';
import { DiscordIcon } from './LoginPage';

interface RegisterPageProps {
  onRegisterSuccess?: (user: any, token: string) => void;
  onNavigate?: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/dashboard';

      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'discord',
          callbackURL: redirect
        })
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || data.error || 'Failed to start Discord authentication');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 sm:p-10 space-y-6 shadow-xl shadow-black/40 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#172033] border border-[#1F2937] flex items-center justify-center mx-auto shadow-inner">
          <img src="/icon.png" alt="CatTags" className="w-8 h-8 object-contain" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#F9FAFB] tracking-tight">Create CatTags Account</h2>
          <p className="text-sm text-[#9CA3AF] mt-2 leading-relaxed">
            Link your Discord account to claim your team tag and manage rosters.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-[#EF4444] text-left">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center space-x-3 shadow-lg shadow-[#3B82F6]/25 hover:scale-[1.01] focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <DiscordIcon className="w-5 h-5 fill-current" />
                <span>Continue with Discord</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-[#1F2937]/70 text-xs text-[#6B7280] space-y-2">
          <p>
            Discord authentication provides instant verification without emails or passwords.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
