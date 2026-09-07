import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  FolderDown, 
  Sparkles, 
  Layers, 
  Cpu, 
  FileCode2, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface VersionItem {
  version: string;
  tagName: string;
  name: string;
  minecraft: string;
  loader: string;
  javaVersion: string;
  releaseDate: string;
  downloadUrl: string;
  directFileUrl: string;
  sourcesUrl?: string | null;
  sizeBytes: number;
  sizeHuman: string;
  changelog: string;
}

export const DownloadPage: React.FC = () => {
  const [latestVersion, setLatestVersion] = useState<VersionItem | null>(null);
  const [allVersions, setAllVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [expandedChangelog, setExpandedChangelog] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/download/versions');
        if (res.ok) {
          const data = await res.json();
          setLatestVersion(data.latest || null);
          setAllVersions(data.versions || []);
        } else {
          throw new Error('Could not load version directory');
        }
      } catch (err: any) {
        // Fallback default version
        const fallback: VersionItem = {
          version: '1.0.0',
          tagName: 'v1.0.0',
          name: 'CatTags v1.0.0 - Fabric 1.21.11',
          minecraft: '1.21.11',
          loader: 'Fabric',
          javaVersion: '21+',
          releaseDate: '2026-09-07T11:31:00Z',
          downloadUrl: 'https://github.com/itz0cat/cattags/releases/latest/download/cattags.jar',
          directFileUrl: 'https://github.com/itz0cat/cattags/releases/download/v1.0.0/cattags-1.0.0.jar',
          sourcesUrl: 'https://github.com/itz0cat/cattags/releases/latest/download/cattags-1.0.0-sources.jar',
          sizeBytes: 48781,
          sizeHuman: '47.6 KB',
          changelog: 'Initial official release for Minecraft 1.21.11 Fabric. Features gradient nametags, tab list formatting, in-game verification codes, logo icons, offline caching, and ModMenu configuration.'
        };
        setLatestVersion(fallback);
        setAllVersions([fallback]);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  const latest = latestVersion || {
    version: '1.0.0',
    tagName: 'v1.0.0',
    name: 'CatTags v1.0.0',
    minecraft: '1.21.11',
    loader: 'Fabric',
    sizeHuman: '47.6 KB',
    downloadUrl: 'https://github.com/itz0cat/cattags/releases/latest/download/cattags.jar'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Banner / Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#172033] border border-[#1F2937] text-xs font-semibold text-[#60A5FA]">
          <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Minecraft 1.21.11 Fabric Client Mod</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F9FAFB]">
          Download <span className="bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">CatTags</span>
        </h1>

        <p className="text-base sm:text-lg text-[#9CA3AF] leading-relaxed">
          Enhance your server experience with synchronized gradient nametags, dynamic prefixes, team logos, and tab list formatting.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-[#1F2937] p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Info & Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Latest Stable Release
              </span>
              <span className="px-3 py-1 rounded-md bg-[#172033] border border-[#1F2937] text-[#60A5FA] text-xs font-mono font-bold">
                {latest.tagName || 'v1.0.0'}
              </span>
              <span className="px-3 py-1 rounded-md bg-[#172033] border border-[#1F2937] text-[#9CA3AF] text-xs font-medium">
                MC {latest.minecraft || '1.21.11'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F9FAFB] tracking-tight">
                CatTags for Fabric {latest.minecraft || '1.21.11'}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
                Lightweight client-side mod (~{latest.sizeHuman || '48 KB'}). Works with Vanilla servers, Paper, Fabric, and Velocity networks. Zero server-side installation required.
              </p>
            </div>

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#1F2937]">
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Loader</div>
                <div className="text-sm font-bold text-[#F9FAFB] mt-0.5">Fabric</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#1F2937]">
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Minecraft</div>
                <div className="text-sm font-bold text-[#F9FAFB] mt-0.5">1.21.11</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#1F2937]">
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Java</div>
                <div className="text-sm font-bold text-[#F9FAFB] mt-0.5">Java 21+</div>
              </div>
              <div className="p-3 rounded-xl bg-[#080B12]/80 border border-[#1F2937]">
                <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Storage</div>
                <div className="text-sm font-bold text-[#22C55E] mt-0.5">Persistent CDN</div>
              </div>
            </div>
          </div>

          {/* Right Column: Download Actions */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="p-5 rounded-2xl bg-[#080B12]/90 border border-[#1F2937] space-y-4">
              <div className="text-xs text-[#9CA3AF] flex items-center justify-between">
                <span className="font-semibold text-[#D1D5DB]">Direct Mod Download</span>
                <span className="font-mono text-[11px] text-[#60A5FA]">cattags.jar</span>
              </div>

              {/* Big Primary Button */}
              <a
                href="/api/v1/download/latest"
                download="cattags.jar"
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-white font-bold text-base shadow-xl shadow-[#22C55E]/20 transition-all hover:scale-[1.02] active:scale-[0.99] group cursor-pointer"
              >
                <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                <span>Download CatTags Latest (.jar)</span>
              </a>

              {/* Direct Link Options */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="/api/v1/download/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-xs font-medium text-[#D1D5DB] flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <FolderDown className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Direct CDN Link</span>
                </a>
                <a
                  href="https://github.com/itz0cat/cattags/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-[#172033] border border-[#1F2937] text-xs font-medium text-[#D1D5DB] flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>GitHub Release</span>
                </a>
              </div>

              {/* Persistence Notice */}
              <div className="pt-2 flex items-start space-x-2 text-[11px] text-[#9CA3AF] leading-tight">
                <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span>
                  <strong>Render Persistence Protected:</strong> Files are delivered via GitHub CDN mirrors. Mod downloads never disappear when cloud servers restart.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Installation Guide */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Layers className="w-6 h-6 text-[#3B82F6]" />
          <h2 className="text-2xl font-bold text-[#F9FAFB]">Quick Installation Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#172033] text-[#3B82F6] font-extrabold flex items-center justify-center text-sm border border-[#1F2937]">
                1
              </div>
              <h3 className="text-base font-bold text-[#F9FAFB]">Install Fabric Loader</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Ensure you have the <strong>Fabric Loader for Minecraft 1.21.11</strong> installed in your Minecraft launcher or client manager.
              </p>
            </div>
            <a
              href="https://fabricmc.net/use/installer/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD]"
            >
              <span>Get Fabric Installer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#172033] text-[#3B82F6] font-extrabold flex items-center justify-center text-sm border border-[#1F2937]">
                2
              </div>
              <h3 className="text-base font-bold text-[#F9FAFB]">Install Fabric API</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                CatTags requires the official <strong>Fabric API</strong> mod for networking and nametag rendering events.
              </p>
            </div>
            <a
              href="https://modrinth.com/mod/fabric-api"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD]"
            >
              <span>Download Fabric API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#172033] text-[#3B82F6] font-extrabold flex items-center justify-center text-sm border border-[#1F2937]">
                3
              </div>
              <h3 className="text-base font-bold text-[#F9FAFB]">Add to Mods Folder</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Drop <code className="text-[#60A5FA]">cattags.jar</code> into your Minecraft <code className="text-[#60A5FA]">mods</code> folder and launch the game.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#9CA3AF] bg-[#080B12] p-2 rounded border border-[#1F2937] truncate">
              .minecraft/mods/
            </div>
          </div>
        </div>
      </div>

      {/* In-Game Command Reference */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="text-lg font-bold text-[#F9FAFB]">In-Game Mod Commands</h3>
          </div>
          <span className="text-xs text-[#9CA3AF]">Works on any multiplayer server</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080B12] border border-[#1F2937] flex items-center justify-between group">
            <div>
              <div className="text-xs font-mono font-bold text-[#60A5FA]">/cattags</div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5">Check mod status and current team</div>
            </div>
            <button
              onClick={() => copyToClipboard('/cattags', 'cmd1')}
              className="p-1.5 rounded-lg hover:bg-[#172033] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              title="Copy command"
            >
              {copiedCmd === 'cmd1' ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B12] border border-[#1F2937] flex items-center justify-between group">
            <div>
              <div className="text-xs font-mono font-bold text-[#60A5FA]">/cattags verify &lt;code&gt;</div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5">Redeem 6-char verification code</div>
            </div>
            <button
              onClick={() => copyToClipboard('/cattags verify ', 'cmd2')}
              className="p-1.5 rounded-lg hover:bg-[#172033] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              title="Copy command"
            >
              {copiedCmd === 'cmd2' ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B12] border border-[#1F2937] flex items-center justify-between group">
            <div>
              <div className="text-xs font-mono font-bold text-[#60A5FA]">/cattags cache clear</div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5">Force sync & refresh tags cache</div>
            </div>
            <button
              onClick={() => copyToClipboard('/cattags cache clear', 'cmd3')}
              className="p-1.5 rounded-lg hover:bg-[#172033] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              title="Copy command"
            >
              {copiedCmd === 'cmd3' ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Version Archive Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileCode2 className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-2xl font-bold text-[#F9FAFB]">All Releases & Versions</h2>
          </div>
          <a
            href="https://github.com/itz0cat/cattags/releases"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#60A5FA] hover:text-[#93C5FD] flex items-center space-x-1"
          >
            <span>GitHub Releases</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {loading ? (
          <div className="p-8 rounded-xl bg-[#111827] border border-[#1F2937] text-center text-sm text-[#9CA3AF] flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#3B82F6]" />
            <span>Loading releases...</span>
          </div>
        ) : (
          <div className="rounded-xl border border-[#1F2937] overflow-hidden bg-[#111827]">
            <div className="divide-y divide-[#1F2937]">
              {allVersions.map((v) => {
                const isExpanded = expandedChangelog === v.tagName;
                return (
                  <div key={v.tagName} className="p-5 hover:bg-[#172033]/50 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Version Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-base text-[#F9FAFB]">{v.name}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#172033] border border-[#1F2937] text-xs font-mono font-semibold text-[#60A5FA]">
                            {v.tagName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#080B12] text-[11px] font-medium text-[#9CA3AF] border border-[#1F2937]">
                            Fabric {v.minecraft}
                          </span>
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          Released on {new Date(v.releaseDate).toLocaleDateString()} • Size: {v.sizeHuman}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setExpandedChangelog(isExpanded ? null : v.tagName)}
                          className="px-3 py-1.5 rounded-lg bg-[#080B12] hover:bg-[#172033] border border-[#1F2937] text-xs text-[#9CA3AF] hover:text-[#F9FAFB] flex items-center space-x-1 transition-colors"
                        >
                          <span>Notes</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {v.sourcesUrl && (
                          <a
                            href={v.sourcesUrl}
                            download
                            className="px-3 py-1.5 rounded-lg bg-[#080B12] hover:bg-[#172033] border border-[#1F2937] text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                            title="Download Sources JAR"
                          >
                            Sources
                          </a>
                        )}

                        <a
                          href={v.downloadUrl}
                          download="cattags.jar"
                          className="px-4 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-[#22C55E]/10 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .jar</span>
                        </a>
                      </div>
                    </div>

                    {/* Expandable Changelog */}
                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs text-[#D1D5DB] leading-relaxed whitespace-pre-wrap font-sans">
                        {v.changelog}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
