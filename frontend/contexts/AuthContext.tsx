"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"

// Update the User type to include role and id information
type User = {
  email: string
  role: "chairperson" | "financial"
  name: string
  id: string; // Add user ID
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json(); // Expecting { user: { email, role, name, id }, token: '...' }
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Store the token (VERY IMPORTANT)
          if (data.token) {
            localStorage.setItem("token", data.token);
          }

          return true;
        } else {
            const errorData = await response.json()
            console.error("Login failed", response.status, errorData);
          return false;
        }
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
  };

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token"); // Remove the token
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}