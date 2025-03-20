"use client"
import { useState, useEffect } from "react";
import { createUser, updateUser, deleteUser } from "@/lib/firebase/users";
import { getDocs } from "firebase/firestore";
import { usersCollection } from "@/lib/firebase/users";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  UserCog,
  Crown,
  User,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

type UserRole = 'admin' | 'user';
type UserData = {
  id: string;
  username: string;
  isAllowed: boolean;
  role: UserRole;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(usersCollection);
      const usersData = querySnapshot.docs
        .filter(doc => !doc.data().isDeleted)
        .map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      setUsers(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await createUser(newUsername, newPassword, { role: newRole });
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      fetchUsers();
      toast.success("User created successfully");
    } catch (error) {
      toast.error("Failed to create user");
    }
    setIsLoading(false);
  };

  const handleUpdatePermission = async (userId: string, isAllowed: boolean) => {
    try {
      await updateUser(userId, { isAllowed: !isAllowed });
      fetchUsers();
      toast.success(`User ${isAllowed ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error("Failed to update user permissions");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUser(userId, { role: newRole });
      fetchUsers();
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleChangePassword = async (userId: string, newPassword: string) => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    try {
      await updateUser(userId, { password: newPassword });
      setShowPasswordChange(null);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <form onSubmit={handleCreateUser} className="flex gap-2">
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                className="flex-1"
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="flex-1"
              />
              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isLoading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {users.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No users found. Create a new user to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <Crown className="h-4 w-4 text-amber-500" />
                      ) : (
                        <User className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="font-medium">{user.username}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {showPasswordChange === user.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="password"
                            placeholder="New password"
                            className="w-32 h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleChangePassword(user.id, e.currentTarget.value);
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowPasswordChange(null)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setShowPasswordChange(user.id)}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Change password</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUpdateRole(
                              user.id,
                              user.role === 'admin' ? 'user' : 'admin'
                            )}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle role</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUpdatePermission(user.id, user.isAllowed)}
                          >
                            {user.isAllowed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {user.isAllowed ? 'Disable user' : 'Enable user'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete user</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}