import React from 'react';
import { Terminal, Shield, Sparkles, Download, CheckCircle, ExternalLink, ArrowRight, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DocsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-[#1F2937] pb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#172033] border border-[#1F2937] text-xs font-semibold text-[#60A5FA] mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>Documentation & Quick Start Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F9FAFB] tracking-tight">
          CatTags Integration Guide
        </h1>
        <p className="text-base text-[#9CA3AF] mt-2 max-w-3xl leading-relaxed">
          Everything you need to install the Fabric client mod, configure your team's visual tags,
          and verify players across cracked and online Minecraft 1.21.11 networks.
        </p>
      </div>

      {/* Section 1: Mod Installation */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-xl font-bold text-[#F9FAFB]">Client Mod Installation</h2>
        </div>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          CatTags is a lightweight, zero-crash Fabric mod built for Minecraft 1.21.11.
          It operates purely client-side — servers do not need any mod or plugin installed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
            <span className="text-xs font-bold text-[#3B82F6] uppercase">Step 1</span>
            <h3 className="text-sm font-semibold text-[#F9FAFB]">Install Fabric Loader</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Install Fabric Loader for Minecraft 1.21.11 and install Fabric API into your <code className="text-[#3B82F6] font-mono">.minecraft/mods</code> folder.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
            <span className="text-xs font-bold text-[#3B82F6] uppercase">Step 2</span>
            <h3 className="text-sm font-semibold text-[#F9FAFB]">Download CatTags Mod</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Download the latest release jar (<code className="text-[#3B82F6] font-mono">cattags-1.0.0.jar</code>) from GitHub Releases and place it into your <code className="text-[#3B82F6] font-mono">mods</code> folder.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/itz0cat/cattags/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .jar</span>
              </a>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-2">
            <span className="text-xs font-bold text-[#3B82F6] uppercase">Step 3</span>
            <h3 className="text-sm font-semibold text-[#F9FAFB]">Launch & Play</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Start Minecraft. CatTags will automatically initialize its asynchronous identity cache and query nametags seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: In-Game Commands */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-xl font-bold text-[#F9FAFB]">In-Game Client Commands</h2>
        </div>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          Manage your cache and verify your identity in any server chat:
        </p>
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] divide-y divide-[#1F2937] text-sm">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#3B82F6] font-bold">/cattags status</span>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Displays API server connectivity status and current LRU cached team counts.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#080B12] text-[#9CA3AF] self-start sm:self-center">
              Client
            </span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#3B82F6] font-bold">/cattags reload</span>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Purges local cache and forces an immediate reload of configurations from disk.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#080B12] text-[#9CA3AF] self-start sm:self-center">
              Client
            </span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#3B82F6] font-bold">/cattags resolve &lt;player&gt;</span>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Force queries the API for a specific player's team tag and refreshes rendering.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#080B12] text-[#9CA3AF] self-start sm:self-center">
              Client
            </span>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[#3B82F6] font-bold">/team verify &lt;token&gt;</span>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Redeems an 8-character verification token in-game to instantly link your player identity.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#080B12] text-[#9CA3AF] self-start sm:self-center">
              Verification
            </span>
          </div>
        </div>
      </section>

      {/* Section 3: Verification Flow */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-xl font-bold text-[#F9FAFB]">Identity & Roster Verification</h2>
        </div>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          CatTags supports cracked and offline-mode servers through a cryptographically secure verification token system:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h3 className="text-sm font-bold text-[#F9FAFB] flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#22C55E]" />
              <span>Web Verification Portal</span>
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              If your team owner or admin provided a verification code, you can redeem it directly on our web dashboard without typing in-game.
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA]"
            >
              <span>Go to Verification Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h3 className="text-sm font-bold text-[#F9FAFB] flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#3B82F6]" />
              <span>In-Game Verification</span>
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Run <code className="text-[#3B82F6] font-mono">/team verify &lt;token&gt;</code> in-game on a supported CatTags server to automatically confirm your ownership of that username.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Public API */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h2 className="text-xl font-bold text-[#F9FAFB]">Developer REST API</h2>
        </div>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          CatTags provides high-throughput public JSON endpoints for Discord bots, server plugins, and community websites:
        </p>
        <div className="p-4 rounded-xl bg-[#080B12] border border-[#1F2937] font-mono text-xs space-y-3">
          <div>
            <span className="text-[#22C55E] font-bold">GET</span>{' '}
            <span className="text-[#F9FAFB]">/api/v1/teams</span>
            <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">List public verified teams with pagination.</p>
          </div>
          <div>
            <span className="text-[#22C55E] font-bold">GET</span>{' '}
            <span className="text-[#F9FAFB]">/api/v1/teams/:id</span>
            <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">Fetch team metadata, colors, style JSON, and verified roster.</p>
          </div>
          <div>
            <span className="text-[#3B82F6] font-bold">POST</span>{' '}
            <span className="text-[#F9FAFB]">/api/v1/resolve</span>
            <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">Batch resolve a list of player usernames/UUIDs to their active team nametags.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocsPage;
