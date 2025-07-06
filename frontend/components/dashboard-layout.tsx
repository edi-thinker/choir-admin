// components/dashboard-layout.tsx

"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation" // Import usePathname
import { Users, Music, GraduationCap, LogOut, Menu, X, LayoutDashboard, FolderPlus, Wallet } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import OverviewDashboard from "./overview-dashboard"
import MemberManagement from "./member-management"
import MusicSheetManagement from "./music-sheet-management"
import AlumniManagement from "./alumni-management"
import { Button } from "@/components/ui/button"
import DocumentManagement from "./document-management"
import FinancialManagement from "./financial-management"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { logout, user } = useAuth() // Get user from context
  const router = useRouter()
    const pathname = usePathname();

    useEffect(() => {
    if (!user) {
      router.push("/login"); //redirect to login if not authenticated
    }
    }, [user, router])


// Define menu items based on user role
const getMenuItems = () => {
  const baseItems = [
    { name: "Overview", icon: LayoutDashboard, tab: "overview" },
    { name: "Member Management", icon: Users, tab: "members" },
    { name: "Alumni Management", icon: GraduationCap, tab: "alumni" },
  ]

  // Items specific to chairperson
  const chairpersonItems = [
    { name: "Music Sheets", icon: Music, tab: "music" },
    { name: "Documents", icon: FolderPlus, tab: "documents" },
  ]

  // Items specific to financial leader
  const financialItems = [{ name: "Financial Management", icon: Wallet, tab: "finance" }]

  if (user?.role === "chairperson") {
    return [...baseItems, ...chairpersonItems]
  } else if (user?.role === "financial") {
    return [...baseItems, ...financialItems]
  }

  // Fallback for unknown roles (shouldn't happen)
  return baseItems
}

const menuItems = getMenuItems()

    if (!user) {
        return null; // Or a loading spinner, or a message, etc. while checking auth
    }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }


    useEffect(() => {
    setIsMobileMenuOpen(false);
    }, [pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 border-r border-gray-200/80 bg-white/95 backdrop-blur-lg shadow-xl">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200/50 bg-gradient-to-r from-maroon-50 to-white">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-NKncVzM0Gks5714N7zfi43qPuWhbPe.png"
              alt="St. Philomena Choir Logo"
              width={150}
              height={50}
              className="h-12 w-auto drop-shadow-sm"
            />
          </div>

           {/* Add user info section */}
          <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-maroon-25 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-maroon-500 to-maroon-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-maroon-600 capitalize font-medium">{user?.role} Role</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full transition-all duration-200 ${
                  activeTab === item.tab 
                    ? "bg-gradient-to-r from-maroon-500 to-maroon-600 text-white shadow-lg transform scale-[1.02]" 
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-maroon-50 hover:to-maroon-100 hover:text-maroon-700 hover:shadow-md hover:transform hover:scale-[1.01]"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                  activeTab === item.tab ? 'text-white' : 'text-gray-500 group-hover:text-maroon-600'
                }`} />
                {item.name}
              </button>
            ))}
          </nav>
          <div className="px-4 py-6 border-t border-gray-200/50">
            <Button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-maroon-500 to-maroon-600 hover:from-maroon-600 hover:to-maroon-700 w-full shadow-lg hover:shadow-xl transition-all duration-200 hover:transform hover:scale-[1.02]"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-NKncVzM0Gks5714N7zfi43qPuWhbPe.png"
          alt="St. Philomena Choir Logo"
          width={120}
          height={40}
          className="h-10 w-auto drop-shadow-sm"
        />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-maroon-50 hover:to-maroon-100 hover:text-maroon-700 transition-all duration-200 shadow-sm hover:shadow-md"
           aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white/95 backdrop-blur-lg"  role="dialog" aria-modal="true">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50 bg-gradient-to-r from-maroon-50 to-white">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-NKncVzM0Gks5714N7zfi43qPuWhbPe.png"
                alt="St. Philomena Choir Logo"
                width={120}
                height={40}
                className="h-10 w-auto drop-shadow-sm"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full transition-all duration-200 ${
                    activeTab === item.tab 
                      ? "bg-gradient-to-r from-maroon-500 to-maroon-600 text-white shadow-lg" 
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-maroon-50 hover:to-maroon-100 hover:text-maroon-700 hover:shadow-md"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    activeTab === item.tab ? 'text-white' : 'text-gray-500 group-hover:text-maroon-600'
                  }`} />
                  {item.name}
                </button>
              ))}
            </nav>
            <div className="px-4 py-6 border-t border-gray-200/50">
              <Button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-maroon-500 to-maroon-600 hover:from-maroon-600 hover:to-maroon-700 w-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-72 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
            {activeTab === "overview" && <OverviewDashboard />}
            {activeTab === "members" && <MemberManagement />}
            {activeTab === "alumni" && <AlumniManagement />}
            {activeTab === "music" && user?.role === "chairperson" && <MusicSheetManagement />}
            {activeTab === "documents" && user?.role === "chairperson" && <DocumentManagement />}
            {activeTab === "finance" && user?.role === "financial" && <FinancialManagement />}

            {/* Show access denied message if user tries to access unauthorized tab */}
            {((activeTab === "music" && user?.role !== "chairperson") ||
              (activeTab === "documents" && user?.role !== "chairperson") ||
              (activeTab === "finance" && user?.role !== "financial")) && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center shadow-lg border border-red-200/50">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-8V7a2 2 0 10-4 0v2m0 4h8a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
                  <p className="text-red-600">You don't have permission to access this section.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}