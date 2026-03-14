import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, AuthContextType, Permission, ROLE_PERMISSIONS, UserRole } from '@/types/auth';
import { hashPasswordAsync, hashPassword, generateId, createInitialUsers } from '@/utils/auth';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'onlyboard_auth';
const USERS_STORAGE_KEY = 'onlyboard_users';
const USERS_VERSION_KEY = 'onlyboard_users_version';
const FAILED_ATTEMPTS_KEY = 'onlyboard_failed_attempts';
const CURRENT_USERS_VERSION = '5'; // Bumped for Supabase migration
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // check every minute

interface StoredSession {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  expiresAt: number;
  lastActivity: number;
}

interface FailedAttempts {
  count: number;
  lockedUntil: number | null;
}

function getFailedAttempts(username: string): FailedAttempts {
  try {
    const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (stored) {
      const map = JSON.parse(stored);
      if (map[username]) return map[username];
    }
  } catch {}
  return { count: 0, lockedUntil: null };
}

function setFailedAttempts(username: string, data: FailedAttempts) {
  try {
    const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const map = stored ? JSON.parse(stored) : {};
    map[username] = data;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(map));
  } catch {}
}

function clearFailedAttempts(username: string) {
  try {
    const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (stored) {
      const map = JSON.parse(stored);
      delete map[username];
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(map));
    }
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    // Initialize localStorage users (legacy fallback)
    const storedVersion = localStorage.getItem(USERS_VERSION_KEY);
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers || storedVersion !== CURRENT_USERS_VERSION) {
      const initialUsers = createInitialUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      localStorage.setItem(USERS_VERSION_KEY, CURRENT_USERS_VERSION);
      setUsers(initialUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }

    // Check for existing session with expiry
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const session: StoredSession = JSON.parse(storedAuth);
        const now = Date.now();
        if (session.expiresAt > now && (now - session.lastActivity) < SESSION_TTL_MS) {
          // Session valid — restore user
          setUser({
            id: session.userId,
            username: session.username,
            displayName: session.displayName,
            role: session.role,
            password: '',
            createdAt: '',
          });
          // Update activity timestamp
          session.lastActivity = now;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        } else {
          // Session expired
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);

  // Auto-logout on inactivity (check every minute)
  useEffect(() => {
    if (!user) {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
      return;
    }

    const updateActivity = () => {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        try {
          const session: StoredSession = JSON.parse(storedAuth);
          session.lastActivity = Date.now();
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        } catch {}
      }
    };

    const checkExpiry = () => {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedAuth) { logout(); return; }
      try {
        const session: StoredSession = JSON.parse(storedAuth);
        const now = Date.now();
        if (session.expiresAt <= now || (now - session.lastActivity) >= SESSION_TTL_MS) {
          logout();
        }
      } catch { logout(); }
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, updateActivity));
    activityTimerRef.current = setInterval(checkExpiry, ACTIVITY_CHECK_INTERVAL);

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    };
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const lowerUser = username.toLowerCase();

    // Rate-limit check
    const attempts = getFailedAttempts(lowerUser);
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return false; // Still locked out
    }

    // Try Supabase first
    try {
      const passwordHash = await hashPasswordAsync(password);
      const { data, error } = await (supabase as any)
        .from('app_users')
        .select('id, username, display_name, role')
        .eq('username', lowerUser)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (!error && data) {
        clearFailedAttempts(lowerUser);
        const authedUser: User = {
          id: data.id,
          username: data.username,
          displayName: data.display_name,
          role: data.role as UserRole,
          password: '',
          createdAt: '',
        };
        setUser(authedUser);

        const session: StoredSession = {
          userId: data.id,
          username: data.username,
          displayName: data.display_name,
          role: data.role as UserRole,
          expiresAt: Date.now() + SESSION_TTL_MS,
          lastActivity: Date.now(),
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        return true;
      }
    } catch {
      // Supabase unavailable — fall through to localStorage
    }

    // Fallback to localStorage users
    const localUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]') as User[];
    const hashedPw = hashPassword(password);
    const foundUser = localUsers.find(
      (u) => u.username.toLowerCase() === lowerUser && u.password === hashedPw
    );

    if (foundUser) {
      clearFailedAttempts(lowerUser);
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      const updatedUsers = localUsers.map((u) => (u.id === foundUser.id ? updatedUser : u));
      setUsers(updatedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUser(updatedUser);

      const session: StoredSession = {
        userId: foundUser.id,
        username: foundUser.username,
        displayName: foundUser.displayName,
        role: foundUser.role,
        expiresAt: Date.now() + SESSION_TTL_MS,
        lastActivity: Date.now(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return true;
    }

    // Failed attempt
    const newCount = (attempts.count || 0) + 1;
    setFailedAttempts(lowerUser, {
      count: newCount,
      lockedUntil: newCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : null,
    });
    return false;
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY); // clean up legacy
  }, []);

  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      password: hashPassword(userData.password),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map((u) => {
      if (u.id === id) {
        const updated = { ...u, ...userData };
        if (userData.password && userData.password !== u.password) {
          updated.password = hashPassword(userData.password);
        }
        return updated;
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    if (user && user.id === id) {
      const updatedCurrent = updatedUsers.find((u) => u.id === id);
      if (updatedCurrent) setUser(updatedCurrent);
    }
  };

  const deleteUser = (id: string) => {
    if (user && user.id === id) return;
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, users, createUser, updateUser, deleteUser, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
