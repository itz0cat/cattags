import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';

export const VerifyPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/teams/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      setResult(data);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#172033] border border-[#1F2937] text-[#3B82F6] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
          Redeem Verification Code
        </h1>
        <p className="text-sm text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
          Confirm your Minecraft username and claim your team roster spot using an in-game or team token.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 sm:p-8 space-y-6 shadow-xl">
        {error && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-xs text-[#EF4444] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#F9FAFB]">Verification Successful!</h2>
              <p className="text-xs text-[#9CA3AF] mt-1">{result.message}</p>
            </div>

            {/* In-Game Tag Preview */}
            <div className="p-4 rounded-xl bg-[#080B12] border border-[#1F2937]">
              <span className="text-[11px] font-mono text-[#9CA3AF] uppercase block mb-2">In-Game Preview</span>
              <MinecraftTagPreview
                prefix={result.team?.prefix || 'TEAM'}
                style={result.team?.style || { type: 'SOLID', colors: [result.team?.primaryColor || '#3B82F6'] }}
                playerName={result.minecraftUsername || 'Player'}
                scale={1.1}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {result.teamId && (
                <Link
                  to={`/teams/${result.teamId}`}
                  className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <span>View Team Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2.5 rounded-lg bg-[#172033] hover:bg-[#1E293B] border border-[#1F2937] text-xs font-medium text-[#D1D5DB] transition-colors"
              >
                Verify Another Code
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. NOVA-A1B2C3 or TOKEN"
                className="w-full px-4 py-3 rounded-xl bg-[#080B12] border border-[#1F2937] text-center text-lg font-mono font-bold tracking-wider text-[#F9FAFB] placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none uppercase transition-colors"
              />
              <p className="text-[11px] text-[#6B7280] mt-1.5 text-center">
                Codes are case-insensitive and expire 15 minutes after generation.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 rounded-xl bg-[#3B82F6] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none disabled:opacity-60 cursor-pointer shadow-lg shadow-[#3B82F6]/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Identity</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
