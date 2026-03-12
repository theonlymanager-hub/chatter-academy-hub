import { User, UserRole } from '@/types/auth';

// Simple hash function for client-side password hashing (internal tool)
export function hashPassword(password: string): string {
  let hash = 0;
  if (password.length === 0) return hash.toString();
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function createInitialUsers(): User[] {
  const defaultPassword = hashPassword('only2026');
  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      username: 'luke',
      password: defaultPassword,
      role: 'admin' as UserRole,
      displayName: 'Luke',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'zar',
      password: defaultPassword,
      role: 'supervisor' as UserRole,
      displayName: 'Zar',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'mark',
      password: defaultPassword,
      role: 'supervisor' as UserRole,
      displayName: 'Mark',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'elle',
      password: defaultPassword,
      role: 'data_entry' as UserRole,
      displayName: 'Elle',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'marc',
      password: defaultPassword,
      role: 'chatter' as UserRole,
      displayName: 'Marc',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'jd',
      password: defaultPassword,
      role: 'chatter' as UserRole,
      displayName: 'JD',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'jemimah',
      password: defaultPassword,
      role: 'chatter' as UserRole,
      displayName: 'Jemimah',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'kc',
      password: defaultPassword,
      role: 'chatter' as UserRole,
      displayName: 'KC',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'jane',
      password: defaultPassword,
      role: 'chatter' as UserRole,
      displayName: 'Jane',
      createdAt: now,
    },
  ];
}