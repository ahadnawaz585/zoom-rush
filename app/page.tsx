
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Video } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple redirect to home without any authentication check
    setTimeout(() => {
      Cookies.set("session", "1234566778");
      window.location.replace("/home");
    }, 500); // Small timeout to show loading state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-purple-600 p-3 rounded-full shadow-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Zoom Meeting Bot Manager
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg 
                       text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
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
                       focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 
                     hover:to-purple-900 text-white font-medium py-3 px-4 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                     focus:ring-offset-purple-900 transform transition-all duration-200 
                     hover:shadow-lg hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-purple-200 hover:text-white text-sm transition-colors duration-200">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}