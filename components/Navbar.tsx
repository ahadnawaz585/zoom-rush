"use client";

import { useEffect, useState } from "react";
import { Video, User, LogOut, Menu, X, Moon, Sun } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, UserData } from "@/lib/firebase/users";

export default function Navbar() {
  const [user, setUser] = useState<(UserData & { id: string }) | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Check for session immediately without waiting
  const sessionId = Cookies.get("session");

  // Check for dark mode preference on component mount
  useEffect(() => {
    // First check cookies (for cross-device consistency)
    const darkModeCookie = Cookies.get("darkMode");
    
    if (darkModeCookie === "true") {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (darkModeCookie === "false") {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Fall back to localStorage if no cookie
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Also set cookie for cross-device consistency
    Cookies.set("darkMode", newDarkMode ? "true" : "false", {
      expires: 30,
      secure: true,
      sameSite: 'strict'
    });
  };

  useEffect(() => {
    // Don't attempt to fetch if no session
    if (!sessionId) {
      router.push("/");
      return;
    }

    // Set up cache for user data
    const cachedUser = localStorage.getItem("userData");
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        // Set user from cache immediately
        setUser(userData);
        
        // Verify user in background
        const verifyUser = async () => {
          try {
            setIsLoadingUser(true);
            const freshUserData = await getUserById(sessionId);
            
            // Update cache and state if user data changed
            if (freshUserData && JSON.stringify(freshUserData) !== JSON.stringify(userData)) {
              localStorage.setItem("userData", JSON.stringify(freshUserData));
              setUser(freshUserData);
            }
          } catch (error) {
            console.error("Background user verification failed:", error);
          } finally {
            setIsLoadingUser(false);
          }
        };
        
        // Verify in background after a delay to prioritize UI rendering
        setTimeout(verifyUser, 100);
      } catch (error) {
        console.error("Error parsing cached user data:", error);
        fetchUserData();
      }
    } else {
      fetchUserData();
    }
  }, [router, sessionId]);

  const fetchUserData = async () => {
    if (!sessionId) return;
    
    setIsLoadingUser(true);
    try {
      const userData = await getUserById(sessionId);
      if (userData) {
        // Cache the user data
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("session");
    Cookies.remove("adminSession");
    localStorage.removeItem("userData");
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Skeleton loader for user profile
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
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Video className="h-8 w-8 text-[#0E72ED]" />
              <span className="font-bold text-xl text-gray-800 dark:text-white transition-colors duration-300">ZoomBotic</span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle button */}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize transition-colors duration-300">{user.role || 'user'}</p>
                </div>
                <button
                  onClick={handleLogout}
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
            {/* Theme toggle button (mobile) */}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-3 px-4 transition-colors duration-300">
          <div className="pt-2 pb-3 space-y-1">
          </div>
          
          {isLoadingUser && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex items-center px-3 animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 w-8 h-8"></div>
                <div className="ml-3 space-y-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="ml-auto p-2 rounded-md w-9 h-9 bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          )}
          
          {!isLoadingUser && user && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex items-center px-3">
                <div className="bg-[#E4F2FF] dark:bg-blue-900 rounded-full p-1 transition-colors duration-300">
                  <User className="h-6 w-6 text-[#0E72ED] dark:text-blue-300" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">{user.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize transition-colors duration-300">{user.role || 'user'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
