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
        <h1 className="text-2xl font-bold mb-6 text-gray-600 ">User Management</h1>
        
        <Card className="mb-6 shadow-sm border-0 overflow-hidden">
          <div className="bg-blue-600 px-4 py-3">
            <h2 className="text-white font-medium">Add New User</h2>
          </div>
          <CardContent className="pt-4 pb-4 bg-white">
            <form onSubmit={handleCreateUser} className="flex gap-2">
              <Input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                <SelectTrigger className="w-[120px] border-slate-300 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 overflow-hidden">
          <div className="bg-blue-600 px-4 py-3">
            <h2 className="text-white font-medium">Manage Users</h2>
          </div>
          <CardContent className="pt-4 pb-4 bg-white">
            {users.length === 0 ? (
              <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                <AlertDescription>
                  No users found. Create a new user to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Crown className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="bg-slate-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{user.username}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {user.role}
                      </span>
                      {!user.isAllowed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {showPasswordChange === user.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="password"
                            placeholder="New password"
                            className="w-32 h-8 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
                              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white">
                            Change password
                          </TooltipContent>
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
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 text-white">
                          {user.role === 'admin' ? 'Change to User' : 'Change to Admin'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUpdatePermission(user.id, user.isAllowed)}
                            className={user.isAllowed 
                              ? "text-green-500 hover:text-green-700 hover:bg-slate-100" 
                              : "text-red-500 hover:text-red-700 hover:bg-slate-100"}
                          >
                            {user.isAllowed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 text-white">
                          {user.isAllowed ? 'Disable user' : 'Enable user'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-slate-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 text-white">
                          Delete user
                        </TooltipContent>
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