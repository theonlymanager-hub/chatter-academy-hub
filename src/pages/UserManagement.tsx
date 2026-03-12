import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit2, Trash2, Shield, User as UserIcon, Settings2, LayoutDashboard, Users, GraduationCap, ClipboardList, Star, CalendarDays, MessageSquare, BarChart3, Clock, UserCircle, Heart, BookOpen, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLE_COLORS = {
  admin: "bg-red-500",
  supervisor: "bg-blue-500",
  data_entry: "bg-green-500",
  chatter: "bg-purple-500",
};

const ROLE_LABELS = {
  admin: "Admin",
  supervisor: "Supervisor",
  data_entry: "Data Entry",
  chatter: "Chatter",
};

// Navigation items that can be controlled per role
const NAVIGATION_ITEMS = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, category: "Main" },
  { id: "team", name: "Team Members", icon: Users, category: "Team" },
  { id: "quality", name: "Quality Checks", icon: Star, category: "Team" },
  { id: "tasks", name: "Mark Tasks", icon: ClipboardList, category: "Team" },
  { id: "weekly-tasks", name: "Chatter Tasks", icon: ClipboardList, category: "Team" },
  { id: "training", name: "Training", icon: GraduationCap, category: "Training" },
  { id: "knowledge-base", name: "Knowledge Base", icon: BookOpen, category: "Training" },
  { id: "calendar", name: "Shift Calendar", icon: CalendarDays, category: "Calendar" },
  { id: "shifts", name: "Shift Scheduler", icon: Clock, category: "Calendar" },
  { id: "messages", name: "Mass Messages", icon: MessageSquare, category: "Calendar" },
  { id: "customs", name: "Customs Board", icon: Palette, category: "Operations" },
  { id: "fans", name: "Fan Profiles", icon: Heart, category: "Operations" },
  { id: "clients", name: "Client Profiles", icon: UserCircle, category: "Profiles" },
  { id: "analytics", name: "Analytics", icon: BarChart3, category: "Analytics" },
  { id: "users", name: "User Management", icon: Settings2, category: "Management" },
];

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS = {
  admin: [...NAVIGATION_ITEMS.map(item => item.id)],
  supervisor: [
    "dashboard", "team", "quality", "tasks", "weekly-tasks", "training", 
    "knowledge-base", "calendar", "shifts", "messages", "customs", 
    "fans", "clients", "analytics"
  ],
  data_entry: [
    "dashboard", "team", "quality", "tasks", "weekly-tasks", "training",
    "knowledge-base", "calendar", "shifts", "messages", "customs",
    "fans", "clients", "analytics"
  ],
  chatter: [
    "dashboard", "team", "quality", "weekly-tasks", "training", 
    "knowledge-base", "calendar", "messages", "customs", "fans"
  ],
};

export default function UserManagement() {
  const { users, createUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "chatter" as UserRole,
  });

  // Load permissions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('role-permissions');
    if (saved) {
      try {
        setRolePermissions(JSON.parse(saved));
      } catch {
        // If parsing fails, use defaults
        setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
      }
    }
  }, []);

  // Save permissions to localStorage when changed
  const saveRolePermissions = (permissions: typeof DEFAULT_ROLE_PERMISSIONS) => {
    setRolePermissions(permissions);
    localStorage.setItem('role-permissions', JSON.stringify(permissions));
    toast({
      title: "Success",
      description: "Role permissions updated successfully",
    });
  };

  const handlePermissionToggle = (role: UserRole, itemId: string) => {
    const newPermissions = { ...rolePermissions };
    const currentPerms = newPermissions[role] || [];
    
    if (currentPerms.includes(itemId)) {
      newPermissions[role] = currentPerms.filter(p => p !== itemId);
    } else {
      newPermissions[role] = [...currentPerms, itemId];
    }
    
    saveRolePermissions(newPermissions);
  };

  const resetRoleToDefaults = (role: UserRole) => {
    const newPermissions = { ...rolePermissions };
    newPermissions[role] = [...DEFAULT_ROLE_PERMISSIONS[role]];
    saveRolePermissions(newPermissions);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      displayName: "",
      role: "chatter" as UserRole,
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      });
      return;
    }

    createUser({
      username: formData.username.toLowerCase(),
      password: formData.password,
      displayName: formData.displayName,
      role: formData.role,
    });

    toast({
      title: "Success",
      description: "User created successfully",
    });

    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    // Check if username is taken by another user
    const existingUser = users.find(u => 
      u.username.toLowerCase() === formData.username.toLowerCase() && 
      u.id !== editingUser.id
    );

    if (existingUser) {
      toast({
        title: "Error",
        description: "Username already exists",
        variant: "destructive",
      });
      return;
    }

    const updateData: Partial<User> = {
      username: formData.username.toLowerCase(),
      displayName: formData.displayName,
      role: formData.role,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    updateUser(editingUser.id, updateData);

    toast({
      title: "Success",
      description: "User updated successfully",
    });

    resetForm();
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      toast({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.displayName}?`)) {
      deleteUser(user.id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Don't populate password for security
      displayName: user.displayName,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chatter">Chatter</SelectItem>
                    <SelectItem value="data_entry">Data Entry</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Users ({users.length})
          </CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-white ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"
                    }
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password or leave empty"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatter">Chatter</SelectItem>
                  <SelectItem value="data_entry">Data Entry</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}