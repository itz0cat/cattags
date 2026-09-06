import React from 'react';
import { TeamStyle } from '@cattags/shared';

interface MinecraftTagPreviewProps {
  prefix: string;
  style: TeamStyle;
  logoUrl?: string | null;
  playerName?: string;
  scale?: number;
}

export const MinecraftTagPreview: React.FC<MinecraftTagPreviewProps> = ({
  prefix,
  style,
  logoUrl,
  playerName = 'Steve',
  scale = 1
}) => {
  const isGradient = style.type === 'GRADIENT';
  const isRainbow = style.type === 'RAINBOW';
  const colors = style.colors && style.colors.length > 0 ? style.colors : ['#3B82F6'];

  const getPrefixStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontWeight: style.bold ? '700' : '400',
      fontStyle: style.italic ? 'italic' : 'normal',
      letterSpacing: '0.05em'
    };

    if (isGradient && colors.length > 1) {
      const dir = style.direction === 'RIGHT_TO_LEFT' ? 'to left' : 'to right';
      return {
        ...base,
        background: `linear-gradient(${dir}, ${colors.join(', ')})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block'
      };
    }

    if (isRainbow) {
      return {
        ...base,
        background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block'
      };
    }

    return {
      ...base,
      color: colors[0] || '#3B82F6'
    };
  };

  return (
    <div className="relative rounded-xl border border-[#1F2937] bg-[#080B12] p-6 flex flex-col items-center justify-center overflow-hidden min-h-[160px]">
      {/* Minecraft sky/backdrop subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1F2937_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold mb-3">
        In-Game Nametag Preview
      </span>

      {/* Minecraft nametag bubble */}
      <div
        style={{ transform: `scale(${scale})` }}
        className="relative flex items-center space-x-2 px-3.5 py-1.5 rounded bg-black/60 backdrop-blur-sm border border-black/30 shadow-lg text-sm select-none font-mono tracking-tight"
      >
        {/* Optional Logo */}
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Team Logo"
            className="w-4 h-4 rounded object-cover mr-1"
          />
        )}

        {/* Formatted Tag */}
        <span className="text-gray-400 font-bold">[</span>
        <span style={getPrefixStyle()}>
          {prefix || 'PREFIX'}
        </span>
        <span className="text-gray-400 font-bold">]</span>

        {/* Player Name */}
        <span className="text-white font-medium pl-1 text-shadow">
          {playerName}
        </span>
      </div>

      <div className="mt-4 text-[11px] text-[#6B7280]">
        Rendered exactly as seen above player heads and on the tab list.
      </div>
    </div>
  );
};
