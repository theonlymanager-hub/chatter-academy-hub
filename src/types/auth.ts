export type UserRole = 'admin' | 'supervisor' | 'data_entry' | 'chatter';

export interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: UserRole;
  displayName: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  users: User[];
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'view_dashboard'
  | 'view_team'
  | 'view_training'
  | 'view_quality'
  | 'view_calendar'
  | 'view_shift_scheduler'
  | 'view_mass_messages'
  | 'view_analytics'
  | 'view_profiles'
  | 'view_fan_profiles'
  | 'view_client_profiles'
  | 'view_customs'
  | 'view_chatter_tasks'
  | 'view_knowledge_base'
  | 'edit_schedules'
  | 'edit_data'
  | 'delete_data'
  | 'manage_users'
  | 'view_all_scores'
  | 'view_own_scores_only';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_team',
    'view_training',
    'view_quality',
    'view_calendar',
    'view_shift_scheduler',
    'view_mass_messages',
    'view_analytics',
    'view_profiles',
    'view_fan_profiles',
    'view_client_profiles',
    'view_customs',
    'view_chatter_tasks',
    'view_knowledge_base',
    'edit_schedules',
    'edit_data',
    'delete_data',
    'manage_users',
    'view_all_scores'
  ],
  supervisor: [
    'view_dashboard',
    'view_team',
    'view_training',
    'view_quality',
    'view_calendar',
    'view_shift_scheduler',
    'view_mass_messages',
    'view_analytics',
    'view_profiles',
    'view_fan_profiles',
    'view_client_profiles',
    'view_customs',
    'view_chatter_tasks',
    'view_knowledge_base',
    'edit_schedules',
    'edit_data',
    'view_all_scores'
  ],
  data_entry: [
    'view_dashboard',
    'view_team',
    'view_training',
    'view_quality',
    'view_calendar',
    'view_mass_messages',
    'view_analytics',
    'view_profiles',
    'view_fan_profiles',
    'view_client_profiles',
    'view_customs',
    'view_chatter_tasks',
    'view_knowledge_base',
    'edit_data',
    'view_all_scores'
  ],
  chatter: [
    'view_dashboard',
    'view_team',
    'view_training',
    'view_calendar',
    'view_mass_messages',
    'view_fan_profiles',
    'view_customs',
    'view_chatter_tasks',
    'view_knowledge_base',
    'view_own_scores_only'
  ]
};