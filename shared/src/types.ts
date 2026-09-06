export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type StyleType = 'SOLID' | 'GRADIENT' | 'RAINBOW';

export type GradientDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

export type TeamStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type IdentifierType = 'CRACKED_USERNAME' | 'MOJANG_UUID' | 'OFFLINE_UUID';

export interface TeamStyle {
  type: StyleType;
  colors: string[];
  direction?: GradientDirection;
  bold?: boolean;
  italic?: boolean;
}

export interface CompactTeamDto {
  id: string;
  slug: string;
  name: string;
  prefix: string;
  style: TeamStyle;
  logo?: string | null;
  version: number;
}

export interface PlayerResolveItem {
  username: string;
  uuid?: string;
}

export interface PlayerResolveRequest {
  players: PlayerResolveItem[];
}

export interface ResolvedPlayerResult {
  identifier: string;
  username: string;
  uuid?: string;
  team: CompactTeamDto | null;
}

export interface PlayerResolveResponse {
  players: ResolvedPlayerResult[];
  timestamp: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  minecraftUsername: string;
  minecraftUuid?: string | null;
  identifierType: IdentifierType;
  role: TeamRole;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  shortName?: string | null;
  prefix: string;
  description?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  gradientEnabled: boolean;
  gradientDirection: GradientDirection;
  style: TeamStyle;
  verified: boolean;
  status: TeamStatus;
  ownerId: string;
  version: number;
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface VerificationToken {
  id: string;
  teamId: string;
  minecraftUsername: string;
  code: string;
  expiresAt: string;
  used: boolean;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  service: string;
  timestamp: string;
  database: 'connected' | 'disconnected';
}

export interface SystemConfigResponse {
  version: string;
  maxTeamsPerUser: number;
  maxMembersPerTeam: number;
  maxLogoSizeBytes: number;
  allowedLogoMimeTypes: string[];
  clientCacheTtlSeconds: number;
}
