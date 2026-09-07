import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
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
          <FileText className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#F9FAFB]">Terms of Service</h1>
        <p className="text-sm text-[#9CA3AF] mt-2">
          Effective Date: September 6, 2026 &bull; Last updated: September 6, 2026
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#D1D5DB] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the CatTags website (cattags-api.onrender.com), Discord authentication,
            or the CatTags Fabric Minecraft mod, you agree to be bound by these Terms of Service. If you do not
            agree with any part of these terms, you may not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">2. One-Team-Per-Player Policy</h2>
          <p>
            To prevent identity collision and maintain fair community recognition, each user and verified Minecraft
            account may only create, own, or belong to <strong>one team at a time</strong>. If you are already part of an
            existing team, you must leave or delete that team before registering a new team.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">3. Permitted Use & Code of Conduct</h2>
          <p>
            CatTags provides custom nametags, tablist prefixes, and chat styling for Minecraft players. When registering
            team names, prefixes, descriptions, and logos, you agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#9CA3AF] ml-2">
            <li>Use hateful, racist, obscene, defamatory, or abusive prefixes or descriptions.</li>
            <li>Impersonate official Minecraft servers, staff, or trademarked organizations without authorization.</li>
            <li>Upload malicious, offensive, or copyright-infringing images as team badges or logos.</li>
            <li>Attempt to bypass rate limits, probe security vulnerabilities, or attack our backend infrastructure.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">4. Moderation & Termination</h2>
          <p>
            We reserve the right to suspend or remove any team, member association, or user account that violates
            these guidelines without prior notice. Team owners have the authority to remove (&quot;kick&quot;) members from their
            own team at their discretion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">5. Disclaimer of Warranties</h2>
          <p>
            The CatTags mod and web services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. While our mod is
            engineered with a Zero-Crash Guarantee and offline disk caching, we are not affiliated with Mojang Studios
            or Microsoft.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#F9FAFB]">6. Contact & Support</h2>
          <p>
            For inquiries, reports of policy violations, or team disputes, join our official Discord server or
            reach out via our GitHub issue tracker.
          </p>
        </section>
      </div>
    </div>
  );
};
