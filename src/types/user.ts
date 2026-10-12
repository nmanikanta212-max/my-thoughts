export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  organization: string;
  avatarUrl: string;
  createdAt: string;
  totalExportsCount: number;
  totalRenderMinutes: number;
  creditsBalance: string; // 'Unlimited (0 Credits Required)'
  isLoggedIn: boolean;
}

export interface ExportHistoryItem {
  id: string;
  filmTitle: string;
  resolution: string;
  fps: number;
  durationSeconds: number;
  fileSizeMb: number;
  timestamp: string;
  downloadUrl?: string;
}

export const INITIAL_USER: UserProfile = {
  id: 'usr-manikanta-001',
  name: 'Manikanta N.',
  email: 'n.manikanta212@gmail.com',
  role: 'Master Director & Cinematographer',
  tier: 'Studio Pro (0 Credits / Unlimited 4K)',
  organization: 'CineForge Ultra Studios',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  createdAt: '2026-01-15',
  totalExportsCount: 14,
  totalRenderMinutes: 84.5,
  creditsBalance: 'Unlimited (0 Credits)',
  isLoggedIn: true,
};
