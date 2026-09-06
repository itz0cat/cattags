import React, { useState } from 'react';

export const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

interface LoginPageProps {
  onLoginSuccess?: (user: any, token: string) => void;
  onNavigate?: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
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
          <h2 className="text-2xl font-extrabold text-[#F9FAFB] tracking-tight">Sign in to CatTags</h2>
          <p className="text-sm text-[#9CA3AF] mt-2 leading-relaxed">
            Manage your persistent Minecraft 1.21.11 team identity and in-game nametags.
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
            Instant access powered by Discord OAuth. No password or email verification required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
