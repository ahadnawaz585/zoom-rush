"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Video, User, Lock, Moon, Sun } from "lucide-react";
import { getUserByUsername } from "@/lib/firebase/users";
import bcrypt from 'bcryptjs';
// import { GlowContainer } from "@/components/ui/GlowContainer";

const generateRandomSession = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false });
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Check for saved theme preference on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
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
  };

  const validateForm = () => {
    const errors = {
      username: username.trim() === "",
      password: password.trim() === ""
    };
    
    setFieldErrors(errors);
    
    if (errors.username || errors.password) {
      setError("Please fill in all required fields");
      return false;
    }
    
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setError("");
    
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const user: any = await getUserByUsername(username);
      if (!user) {
        setError("User not found");
        setIsLoading(false);
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        setError("Invalid password");
        setIsLoading(false);
        return;
      }

      if (!user.isAllowed) {
        setError("User not allowed to login");
        setIsLoading(false);
        return;
      }

      Cookies.set("session", user.id, { 
        expires: 7,
        secure: true, 
        sameSite: 'strict' 
      });

      if (user.role === 'admin') {
        const adminSession = generateRandomSession();
        Cookies.set("adminSession", adminSession, { 
          expires: 7,
          secure: true,
          sameSite: 'strict'
        });
      }

      // Save dark mode preference to persist after login
      Cookies.set("darkMode", darkMode ? "true" : "false", {
        expires: 30,
        secure: true,
        sameSite: 'strict'
      });

      // Use Next.js router for faster navigation without a full page reload
      router.push("/home");
    } catch (error) {
      setError("An error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-gray-50'}`}>
      <div className={`w-full max-w-md rounded-xl shadow-lg p-8 border transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
        {/* Theme toggle button */}

        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Header with Zoom-style branding */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className={`bg-blue-600 p-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 mb-6`}>
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            ZoomBotic
          </h1>
          <p className={`mt-2 text-center text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sign in to manage your automated meeting assistants
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 text-red-500 p-4 rounded-md mb-6 
                         text-sm animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="username" className={`block text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`h-5 w-5 transition-colors duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                id="username"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200
                  ${fieldErrors.username ? 'border-red-500 ring-1 ring-red-500' : darkMode ? 'border-gray-600' : 'border-gray-300'}
                  ${darkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-500' : 'bg-gray-50'}
                  ${fieldErrors.username ? 'focus:ring-red-500' : 'focus:ring-blue-500'} 
                  focus:border-transparent`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setFieldErrors({...fieldErrors, username: false});
                    if (!fieldErrors.password) setError("");
                  }
                }}
                placeholder="Enter your username"
                aria-invalid={fieldErrors.username}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1 text-sm text-red-500">Username is required</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label htmlFor="password" className={`block text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="password"
                id="password"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200
                  ${fieldErrors.password ? 'border-red-500 ring-1 ring-red-500' : darkMode ? 'border-gray-600' : 'border-gray-300'}
                  ${darkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-500' : 'bg-gray-50'}
                  ${fieldErrors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'} 
                  focus:border-transparent`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setFieldErrors({...fieldErrors, password: false});
                    if (!fieldErrors.username) setError("");
                  }
                }}
                placeholder="Enter your password"
                aria-invalid={fieldErrors.password}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500">Password is required</p>
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4
                      rounded-lg transition duration-200 focus:outline-none focus:ring-2
                      focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                      disabled:cursor-not-allowed shadow-md
                      hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm transition-colors duration-300 
                         mt-8 text-center text-sm">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Secure access to your Zoom Meeting Bot Manager</p>
          <p className={`mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>© {new Date().getFullYear()} Zoom Video Communications, Inc.</p>
        </div>
      </div>
    </div>
  );
}