import React from 'react';
import { Shield, Sparkles, Zap, Globe, Users, ArrowRight, Download, Server } from 'lucide-react';
import { MinecraftTagPreview } from '../components/MinecraftTagPreview';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#172033] border border-[#1F2937] text-xs font-semibold text-[#60A5FA] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Minecraft Java 1.21.11 Fabric Support</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F9FAFB] leading-tight">
          Team identity,{' '}
          <span className="bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
            everywhere.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
          The persistent team identity and custom tag system for competitive Minecraft communities.
          Register your team once, and every player with the mod sees your custom colors, gradients, and logo.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          <a
            href="https://github.com/itz0cat/cattags/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold shadow-lg shadow-[#22C55E]/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Download Mod (.jar)</span>
          </a>
          <button
            onClick={() => onNavigate('create-team')}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-semibold shadow-lg shadow-[#3B82F6]/20 transition-all hover:scale-[1.02]"
          >
            <span>Register Your Team</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-[#111827] hover:bg-[#172033] text-[#F9FAFB] font-medium border border-[#1F2937] transition-all"
          >
            <span>Browse Directory</span>
          </button>
        </div>

        {/* Live Preview interactive hero demo */}
        <div className="mt-12 max-w-md mx-auto shadow-2xl shadow-[#3B82F6]/10">
          <MinecraftTagPreview
            prefix="NOVA"
            style={{
              type: 'GRADIENT',
              colors: ['#3B82F6', '#06B6D4'],
              direction: 'LEFT_TO_RIGHT',
              bold: true,
              italic: false
            }}
            playerName="Steve"
            scale={1.1}
          />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#172033] text-[#3B82F6] flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">Cracked & Offline Ready</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              No Microsoft account required. Built for offline and cracked networks with an in-game verification token system.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#172033] text-[#3B82F6] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">Custom Gradients & Logos</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Express your squad's colors. Choose custom two-color or multi-color gradients, bold, italic, or custom PNG badges.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#3B82F6]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#172033] text-[#3B82F6] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">Zero Render Lag</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Batch identity queries, local LRU disk caching, and asynchronous networking ensure zero dropped frames in-game.
            </p>
          </div>
        </div>
      </section>

      {/* In-Game Command Help */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-6 h-6 text-[#3B82F6]" />
            <h2 className="text-xl font-bold text-[#F9FAFB]">In-Game Client Commands</h2>
          </div>
          <p className="text-sm text-[#9CA3AF] mb-6">
            Everything syncs automatically in the background, but you can inspect and control your cache at any time:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded bg-[#080B12] border border-[#1F2937]">
              <span className="text-[#3B82F6] font-bold">/cattags status</span>
              <p className="text-[#9CA3AF] mt-1 font-sans">View connection status & cached team counts</p>
            </div>
            <div className="p-3 rounded bg-[#080B12] border border-[#1F2937]">
              <span className="text-[#3B82F6] font-bold">/cattags reload</span>
              <p className="text-[#9CA3AF] mt-1 font-sans">Reload configurations and team database from disk</p>
            </div>
            <div className="p-3 rounded bg-[#080B12] border border-[#1F2937]">
              <span className="text-[#3B82F6] font-bold">/cattags resolve &lt;player&gt;</span>
              <p className="text-[#9CA3AF] mt-1 font-sans">Force-resolve a player's team identity immediately</p>
            </div>
            <div className="p-3 rounded bg-[#080B12] border border-[#1F2937]">
              <span className="text-[#3B82F6] font-bold">/team verify &lt;token&gt;</span>
              <p className="text-[#9CA3AF] mt-1 font-sans">Verify your Minecraft identity for team membership</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
