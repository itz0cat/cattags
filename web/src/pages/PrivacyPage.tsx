import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="border-b border-[#1F2937] pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#172033] border border-[#1F2937] text-xs font-semibold text-[#60A5FA] mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>User Privacy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#F9FAFB]">Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mt-2">
          Effective Date: September 6, 2026 &bull; Last updated: September 6, 2026
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#D1D5DB] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">1. What Information We Collect</h2>
          <p>
            CatTags adheres to strict data minimization. We only collect the minimal identifiers necessary
            to associate your Minecraft persona with your registered team:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#9CA3AF] ml-2">
            <li><strong>Discord Account Data:</strong> Your public Discord user ID, avatar URL, and email address (for account identity & auto-joining the community Discord).</li>
            <li><strong>Minecraft Persona:</strong> Your in-game Minecraft username and UUID (when available or linked).</li>
            <li><strong>Team Metadata:</strong> Team names, prefix, style configs, colors, and uploaded logo images.</li>
            <li><strong>No Tracking:</strong> We do NOT log player location, coordinates, chat history, or IP telemetry in-game.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">2. How Information is Used</h2>
          <p>
            Collected data is used solely to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#9CA3AF] ml-2">
            <li>Render team prefixes, nametags, and tablist badges in the Fabric mod.</li>
            <li>Allow team leaders to invite, manage, or remove squad members.</li>
            <li>Synchronize team appearance settings across participating Minecraft game clients.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">3. Offline & Local Storage Caching</h2>
          <p>
            The Fabric mod maintains an LRU disk cache in your Minecraft directory (<code>.minecraft/config/cattags/cache/</code>)
            so team identities render instantly without continuous network calls. This cache stores only public team
            styles and logo images.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">4. Data Deletion & Requests</h2>
          <p>
            You have full control over your data. Team owners may delete their team at any time via the team settings
            tab. Members may leave a team at any time. To request complete deletion of your Discord authentication profile
            or account records, join our official Discord server or file a request on our GitHub.
          </p>
        </section>
      </div>
    </div>
  );
};
