import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, Permission, ROLE_PERMISSIONS } from '@/types/auth';
import { hashPassword, generateId, createInitialUsers } from '@/utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'onlyboard_auth';
const USERS_STORAGE_KEY = 'onlyboard_users';
const USERS_VERSION_KEY = 'onlyboard_users_version';
const CURRENT_USERS_VERSION = '2'; // Bump this to force re-init of user data

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize users if not already stored or if version changed
    const storedVersion = localStorage.getItem(USERS_VERSION_KEY);
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers || storedVersion !== CURRENT_USERS_VERSION) {
      const initialUsers = createInitialUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      localStorage.setItem(USERS_VERSION_KEY, CURRENT_USERS_VERSION);
      sessionStorage.removeItem(AUTH_STORAGE_KEY); // Force re-login
      setUsers(initialUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }

    // Check for existing session
    const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      const userData = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
        .find((u: User) => u.id === authData.userId);
      if (userData) {
        setUser(userData);
      }
    }

    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const hashedPassword = hashPassword(password);
    const foundUser = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === hashedPassword
    );

    if (foundUser) {
      // Update last login
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      setUser(updatedUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: foundUser.id }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      password: hashPassword(userData.password)
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        const updated = { ...user, ...userData };
        // Hash password if it's being updated
        if (userData.password && userData.password !== user.password) {
          updated.password = hashPassword(userData.password);
        }
        return updated;
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    // Update current user if they're being updated
    if (user && user.id === id) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === id);
      if (updatedCurrentUser) {
        setUser(updatedCurrentUser);
      }
    }
  };

  const deleteUser = (id: string) => {
    if (user && user.id === id) {
      // Can't delete yourself
      return;
    }
    
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      users,
      createUser,
      updateUser,
      deleteUser,
      hasPermission
    }}>
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