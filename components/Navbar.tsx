"use client";

import { useEffect, useState } from "react";
import { Video, User, LogOut, Menu, X } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, UserData } from "@/lib/firebase/users";
 // Updated import path

export default function Navbar() {
  const [user, setUser] = useState<(UserData & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionId = Cookies.get("session");
      
      if (!sessionId) {
        router.push("/");
        return;
      }

      try {
        const userData = await getUserById(sessionId);
        if (userData) {
          setUser(userData);
        } else {
          // If user not found, redirect to login
          handleLogout();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("session");
    Cookies.remove("adminSession");
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-800 to-purple-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Video className="h-8 w-8 text-white mr-3" />
              <span className="font-bold text-xl">Zoom Meeting Bot Manager</span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/home" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                Admin Panel
              </Link>
            )}
            {!isLoading && user && (
              <div className="flex items-center space-x-2 ml-4 border-l border-purple-700 pl-4">
                <div className="bg-purple-700 rounded-full p-1">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-purple-200 capitalize">{user.role || 'user'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 rounded-md hover:bg-purple-700 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-700 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-900 pb-3 px-4">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/home" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
          {!isLoading && user && (
            <div className="pt-4 pb-3 border-t border-purple-700">
              <div className="flex items-center px-3">
                <div className="bg-purple-700 rounded-full p-1">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{user.username}</div>
                  <div className="text-sm text-purple-200 capitalize">{user.role || 'user'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto p-2 rounded-md hover:bg-purple-700 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}