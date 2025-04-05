"use client";

import { useEffect, useState } from "react";
import { Video, User, LogOut, Menu, X, Moon, Sun, Shield, UserCog } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, getUserName, UserData } from "@/lib/firebase/users";
import LogoutConfirmationDialog from "@/components/LogoutConfirmationDialog";

export default function Navbar() {
  const [user, setUser] = useState<(UserData & { id: string; role?: string }) | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const router = useRouter();
  

  const sessionId = Cookies.get("session");
  const adminSession = Cookies.get("adminSession");




  
  useEffect(() => {
    const darkModeCookie = Cookies.get("darkMode");
    if (darkModeCookie === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (darkModeCookie === "false") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    Cookies.set("darkMode", newDarkMode ? "true" : "false", {
      expires: 30,
      secure: true,
      sameSite: "strict",
    });
  };

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }

    const cachedUser = localStorage.getItem("userData");
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        
        // Ensure role is properly set
        if (!userData.role && userData.isAdmin) {
          userData.role = "admin";
        } else if (!userData.role) {
          userData.role = "user";
        }
        
        // Normalize role to lowercase
        if (userData.role) {
          userData.role = userData.role.toLowerCase();
        }
        
        setUser(userData);

        const verifyUser = async () => {
          try {
            setIsLoadingUser(true);
            const freshUserData: any = await getUserName(sessionId);
            if (freshUserData) {
              // Ensure role is properly set in fresh data
              if (!freshUserData.role && adminSession) {
                freshUserData.role = "admin";
              } else if (!freshUserData.role) {
                freshUserData.role = "user";
              }
              
              // Always normalize to lowercase
              if (freshUserData.role) {
                freshUserData.role = freshUserData.role.toLowerCase();
              }
              
              // Compare and update if different
              if (JSON.stringify(freshUserData) !== JSON.stringify(userData)) {
                localStorage.setItem("userData", JSON.stringify(freshUserData));
                setUser(freshUserData);
              }
            }
          } catch (error) {
            console.error("Background user verification failed:", error);
          } finally {
            setIsLoadingUser(false);
          }
        };

        setTimeout(verifyUser, 100);
      } catch (error) {
        console.error("Error parsing cached user data:", error);
        fetchUserData();
      }
    } else {
      fetchUserData();
    }
  }, [router, sessionId, adminSession]);

  const fetchUserData = async () => {
    if (!sessionId) return;
    setIsLoadingUser(true);
    try {
      const userData: any = await getUserName(sessionId);
      if (userData) {
        // Ensure role is properly set
        if (!userData.role && adminSession) {
          userData.role = "admin";
        } else if (!userData.role) {
          userData.role = "user";
        }
        
        // Always normalize to lowercase
        if (userData.role) {
          userData.role = userData.role.toLowerCase();
        }
        
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
      } else {
        performLogout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const showLogoutDialog = () => setIsLogoutDialogOpen(true);
  const closeLogoutDialog = () => setIsLogoutDialogOpen(false);

  const performLogout = () => {
    Cookies.remove("session");
    Cookies.remove("adminSession");
    localStorage.removeItem("userData");
    router.push("/");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Get user role with proper fallback
  const getUserRole = () => {
    if (!user) return "";
    return user.role ? user.role.toLowerCase() : "user";
  };
  
  const isAdmin = () => {
    const role = getUserRole();
    const hasAdminSession = !!adminSession;
    
    // Check both role and admin session for better security
    return role === "admin" && hasAdminSession;
  };

  const navigateToUserManagement = () => {
    router.push("/users");
  };

  const UserProfileSkeleton = () => (
    <div className="flex items-center space-x-2 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4 animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 w-7 h-7"></div>
      <div className="space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
      <div className="ml-2 p-2 rounded-md w-9 h-9 bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );

  return (
    <>
      {/* Admin Banner */}
      {!isLoadingUser && isAdmin() && (
        <div className="bg-blue-600 dark:bg-blue-800 text-white text-center py-1 text-sm font-medium transition-colors duration-300">
          You are logged in as <span className="uppercase font-semibold">Admin</span>
        </div>
      )} 

      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center">
              <Link href="/home" className="flex items-center space-x-2">
                <Video className="h-8 w-8 text-[#0E72ED]" />
                <span className="font-bold text-xl text-gray-800 dark:text-white transition-colors duration-300">ZoomBotic</span>
                
                {/* Admin indicator next to app name */}
                {!isLoadingUser && isAdmin() && (
                  <div className="flex items-center ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md transition-colors duration-300">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-1" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase">Admin</span>
                  </div>
                )}
              </Link>
            </div>
              
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Admin Tools */}
              {!isLoadingUser && isAdmin() && (
                <button
                  onClick={navigateToUserManagement}
                  className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  <UserCog className="h-4 w-4" />
                  <span>User Management</span>
                </button>
              )}
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? "bg-gray-700 text-yellow-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {isLoadingUser && <UserProfileSkeleton />}

              {!isLoadingUser && user && (
                <div className="flex items-center space-x-2 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
                  <div className="bg-[#E4F2FF] dark:bg-blue-900 rounded-full p-1 transition-colors duration-300">
                    <User className="h-5 w-5 text-[#0E72ED] dark:text-blue-300" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize transition-colors duration-300">{getUserRole()}</p>
                  </div>
                  <button
                    onClick={showLogoutDialog}
                    className="ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-100 text-gray-700"}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-3 px-4 transition-colors duration-300">
            {isLoadingUser ? (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <UserProfileSkeleton />
              </div>
            ) : user && (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-3">
                  <div className="bg-[#E4F2FF] dark:bg-blue-900 rounded-full p-1">
                    <User className="h-6 w-6 text-[#0E72ED] dark:text-blue-300" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-100">{user.username}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{getUserRole()}</div>
                  </div>
                  <button
                    onClick={showLogoutDialog}
                    className="ml-auto p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                
                {/* Mobile admin indicators and actions */}
                {isAdmin() && (
                  <div className="mt-3 px-3 space-y-2">
                    <div className="flex items-center bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-md">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-2" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">Admin Access</span>
                    </div>
                    
                    {/* Mobile admin actions */}
                    <button
                      onClick={navigateToUserManagement}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors duration-300"
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      User Management
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={closeLogoutDialog}
        onConfirm={performLogout} 
        darkMode={darkMode}
      />
    </>
  );
}