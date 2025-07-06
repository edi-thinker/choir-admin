"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left section - Maroon gradient background */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-maroon-500 to-maroon-800 text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Background pattern elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-maroon-300 opacity-20"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-maroon-300 opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-maroon-300 opacity-10"></div>
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full bg-maroon-300 opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-maroon-900 opacity-30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo and welcome message */}
          <div className="flex flex-row items-center mb-12">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-NKncVzM0Gks5714N7zfi43qPuWhbPe.png"
              alt="St. Philomena Choir Logo"
              width={50}
              height={50}
              className="h-10 w-auto mr-3"
            />
            <h1 className="text-2xl font-bold">St. Philomena Choir</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">WELCOME BACK</h2>
          <div className="w-12 h-1 bg-white mb-6"></div>
          <p className="text-maroon-100 mb-8 max-w-md">
            Sign in to access the choir administration dashboard.
          </p>

        </div>
      </div>

      {/* Right section - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 min-h-screen md:min-h-0 bg-gray-50 md:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo and choir name (visible only on smaller screens) */}
          <div className="flex flex-col items-center md:hidden mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 border border-gray-100">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-NKncVzM0Gks5714N7zfi43qPuWhbPe.png"
                alt="St. Philomena Choir Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 text-center">St. Philomena Choir</h1>

          </div>

          {/* Mobile form container */}
          <div className="bg-white md:bg-transparent rounded-2xl md:rounded-none shadow-xl md:shadow-none border md:border-0 border-gray-100 p-6 md:p-0">
            <div className="text-center md:text-center mb-8 md:mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
              <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the dashboard</p>
            </div>

            <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5 md:space-y-4">
              <div>
                <Label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </Label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-xl md:rounded-md focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 transition-all duration-200"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 md:py-2 border border-gray-300 rounded-xl md:rounded-md focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-4 w-4 text-maroon-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="text-maroon-600 hover:text-maroon-700 font-medium">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl md:rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-maroon-600 hover:bg-maroon-700 disabled:bg-maroon-400 text-white font-semibold py-3.5 md:py-2 px-4 rounded-xl md:rounded-md transition-all duration-200 shadow-lg md:shadow-none hover:shadow-xl md:hover:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : "Sign in"}
            </Button>

            </form>
            
            {/* Mobile security footer - only visible on small screens */}
            <div className="text-center mt-6 md:hidden">
              <p className="text-xs text-gray-500">
                🔒 Secured with enterprise-grade authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}