"use client"
import { useState, useEffect } from "react";
import { createUser, updateUser, deleteUser } from "@/lib/firebase/users";
import { getDocs } from "firebase/firestore";
import { usersCollection } from "@/lib/firebase/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Cookies from "js-cookie";
import {
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  UserCog,
  Crown,
  User,
  Lock,
  Search,
  RefreshCw,
  Shield,
  ShieldAlert,
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
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check for dark mode
  useEffect(() => {
    const darkModeCookie = Cookies.get("darkMode");
    if (darkModeCookie === "true") {
      setIsDarkMode(true);
    } else if (darkModeCookie === "false") {
      setIsDarkMode(false);
    } else {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
      }
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDarkMode(hasDarkClass);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      const querySnapshot = await getDocs(usersCollection);
      const usersData = querySnapshot.docs
        .filter(doc => !doc.data().isDeleted)
        .map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      setUsers(usersData);
      setFilteredUsers(usersData);
      setIsLoading(false);
      setRefreshing(false);
    } catch (error) {
      toast.error("Failed to fetch users");
      setIsLoading(false);
      setRefreshing(false);
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
      <div className={`max-w-7xl mx-auto p-6 ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-blue-700 p-3 rounded-lg shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">User Management</h1>
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg shadow-sm"
              />
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 absolute left-3 top-2.5" />
            </div>
            <Button 
              onClick={fetchUsers}
              variant="outline" 
              className="flex items-center gap-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 dark:border-blue-800 dark:hover:border-blue-700 dark:text-blue-400 dark:hover:text-blue-300 shadow-sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Add New User Panel */}
          <Card className="shadow-lg border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden md:col-span-1">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-semibold">New User</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
                  <Input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                  <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                    <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="user" className="dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>User</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg dark:from-blue-700 dark:to-indigo-800 dark:hover:from-blue-800 dark:hover:to-indigo-900"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      <span>Create User</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Manage Users Panel */}
          <Card className="shadow-lg border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserCog className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-semibold">Manage Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white dark:bg-gray-800">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <Alert className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-300 rounded-lg">
                  <div className="flex items-center gap-3 py-3">
                    <ShieldAlert className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <AlertDescription>
                      {searchQuery ? "No users match your search." : "No users found. Create a new user to get started."}
                    </AlertDescription>
                  </div>
                </Alert>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        {user.role === 'admin' ? (
                          <div className="bg-gradient-to-br from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 p-3 rounded-lg shadow-sm">
                            <Crown className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 p-3 rounded-lg shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-100 text-lg block">{user.username}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2.5 py-1 rounded-full ${
                              user.role === 'admin' 
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                            }`}>
                              {user.role}
                            </span>
                            {!user.isAllowed && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                                Disabled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {showPasswordChange === user.id ? (
                          <div className="flex gap-1 mr-2 w-full sm:w-auto">
                            <Input
                              type="password"
                              placeholder="New password"
                              className="w-full sm:w-36 h-9 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 rounded-md"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleChangePassword(user.id, e.currentTarget.value);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowPasswordChange(null)}
                              className="h-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPasswordChange(user.id)}
                                className="h-9 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-md"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-white dark:bg-gray-700">
                              Change password
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateRole(
                                user.id,
                                user.role === 'admin' ? 'user' : 'admin'
                              )}
                              className="h-9 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-md"
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-800 text-white dark:bg-gray-700">
                            {user.role === 'admin' ? 'Change to User' : 'Change to Admin'}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant={user.isAllowed ? "outline" : "default"}
                              onClick={() => handleUpdatePermission(user.id, user.isAllowed)}
                              className={`h-9 rounded-md ${
                                user.isAllowed 
                                  ? "border-gray-200 dark:border-gray-700 text-green-500 hover:text-green-600 hover:border-green-200" 
                                  : "bg-red-500 hover:bg-red-600 text-white border-none"
                              }`}
                            >
                              {user.isAllowed ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-800 text-white dark:bg-gray-700">
                            {user.isAllowed ? 'Disable user' : 'Enable user'}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-9 text-red-500 hover:text-red-600 border-gray-200 dark:border-gray-700 hover:border-red-200 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-800 text-white dark:bg-gray-700">
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
      </div>
    </TooltipProvider>
  );
}