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
  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      username: 'luke',
      password: hashPassword('Boss2026!'),
      role: 'admin' as UserRole,
      displayName: 'Luke',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'zar',
      password: hashPassword('Zar$uper9'),
      role: 'supervisor' as UserRole,
      displayName: 'Zar',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'mark',
      password: hashPassword('M4rkExec!'),
      role: 'supervisor' as UserRole,
      displayName: 'Mark',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'elle',
      password: hashPassword('Elle#Data5'),
      role: 'data_entry' as UserRole,
      displayName: 'Elle',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'marc',
      password: hashPassword('Ch4tMarc!'),
      role: 'chatter' as UserRole,
      displayName: 'Marc',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'jd',
      password: hashPassword('JDshift#7'),
      role: 'chatter' as UserRole,
      displayName: 'JD',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'jemimah',
      password: hashPassword('Jem!mah22'),
      role: 'chatter' as UserRole,
      displayName: 'Jemimah',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'kc',
      password: hashPassword('KCwork$8'),
      role: 'chatter' as UserRole,
      displayName: 'KC',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'jane',
      password: hashPassword('Jan3shift!'),
      role: 'chatter' as UserRole,
      displayName: 'Jane',
      createdAt: now,
    },
    {
      id: generateId(),
      username: 'doug',
      password: hashPassword('Doug@Admin1'),
      role: 'admin' as UserRole,
      displayName: 'Doug',
      createdAt: now,
    },
  ];
}