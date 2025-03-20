// components/Login.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Video } from "lucide-react";
import { getUserByUsername } from "@/lib/firebase/users";
import bcrypt from 'bcryptjs';

// Function to generate a random string for admin session
const generateRandomSession = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

      // Set session cookie for all users
      Cookies.set("session", user.id, { 
        expires: 7, // Cookie expires in 7 days
        secure: true, 
        sameSite: 'strict' 
      });

      // If user is admin, also set adminSession with random value
      if (user.role === 'admin') {
        const adminSession = generateRandomSession();
        Cookies.set("adminSession", adminSession, { 
          expires: 7,
          secure: true,
          sameSite: 'strict'
        });
      }

      window.location.replace("/home");
    } catch (error) {
      setError("An error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-purple-600 p-3 rounded-full shadow-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Zoom Meeting Bot Manager
        </h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-purple-100 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg 
                       text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg 
                       text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 
                     hover:to-purple-900 text-white font-medium py-3 px-4 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}