export const BRAND = {
  name: 'CatTags',
  creator: 'ItzCat',
  tagline: 'Team identity, everywhere.',
  modId: 'cattags',
  defaultBackendUrl: 'https://cattags-api.onrender.com'
} as const;

export const PALETTE = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryBright: '#60A5FA',
  background: '#080B12',
  surface: '#111827',
  surfaceElevated: '#172033',
  border: '#1F2937',
  borderActive: '#3B82F6',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  textDisabled: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#38BDF8'
} as const;

export const DEFAULT_STYLE = {
  type: 'SOLID' as const,
  colors: ['#3B82F6'],
  direction: 'LEFT_TO_RIGHT' as const,
  bold: true,
  italic: false
};

export const LIMITS = {
  maxPrefixLength: 10,
  maxTeamNameLength: 32,
  maxSlugLength: 32,
  maxLogoSizeBytes: 512 * 1024, // 512 KB
  maxBatchResolveSize: 100
} as const;
