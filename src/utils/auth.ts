import { User, UserRole } from '@/types/auth';

/**
 * SHA-256 hash (hex) — matches the Postgres digest('...','sha256') output.
 * Falls back to the legacy simple hash when SubtleCrypto is unavailable.
 */
export async function hashPasswordAsync(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback — simple 32-bit hash (legacy, for offline dev only)
  return hashPassword(password);
}

/** Legacy simple hash — kept for backwards compat with localStorage users */
export function hashPassword(password: string): string {
  let hash = 0;
  if (password.length === 0) return hash.toString();
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createInitialUsers(): User[] {
  const now = new Date().toISOString();

  return [
    { id: generateId(), username: 'luke', password: hashPassword('Boss2026!'), role: 'admin' as UserRole, displayName: 'Luke', createdAt: now },
    { id: generateId(), username: 'zar', password: hashPassword('Zar$uper9'), role: 'supervisor' as UserRole, displayName: 'Zar', createdAt: now },
    { id: generateId(), username: 'mark', password: hashPassword('M4rkExec!'), role: 'supervisor' as UserRole, displayName: 'Mark', createdAt: now },
    { id: generateId(), username: 'elle', password: hashPassword('Elle#Data5'), role: 'data_entry' as UserRole, displayName: 'Elle', createdAt: now },
    { id: generateId(), username: 'marc', password: hashPassword('Ch4tMarc!'), role: 'chatter' as UserRole, displayName: 'Marc', createdAt: now },
    { id: generateId(), username: 'jd', password: hashPassword('JDshift#7'), role: 'chatter' as UserRole, displayName: 'JD', createdAt: now },
    { id: generateId(), username: 'jemimah', password: hashPassword('Jem!mah22'), role: 'chatter' as UserRole, displayName: 'Jemimah', createdAt: now },
    { id: generateId(), username: 'kc', password: hashPassword('KCwork$8'), role: 'chatter' as UserRole, displayName: 'KC', createdAt: now },
    { id: generateId(), username: 'jane', password: hashPassword('Jan3shift!'), role: 'chatter' as UserRole, displayName: 'Jane', createdAt: now },
    { id: generateId(), username: 'doug', password: hashPassword('Doug@Admin1'), role: 'admin' as UserRole, displayName: 'Doug', createdAt: now },
    { id: generateId(), username: 'sam', password: hashPassword('Guest$am1'), role: 'chatter' as UserRole, displayName: 'Sam (Guest)', createdAt: now },
    { id: generateId(), username: 'mateo', password: hashPassword('Mat3o$upe!'), role: 'supervisor' as UserRole, displayName: 'Mateo', createdAt: now },
  ];
}
