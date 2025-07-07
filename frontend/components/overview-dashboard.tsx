"use client"

import { useState, useEffect } from "react"
import { Users, GraduationCap, Music } from "lucide-react" // Removed Mic2
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MessagingSystem from "./messaging-system"

export default function OverviewDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    totalAlumni: 0,
    totalMusicSheets: 0,
    // upcomingEvents: 0,  // Removed upcomingEvents
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // Use Promise.all, but only for the remaining endpoints
        const [membersResponse, alumniResponse, musicSheetsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/members/count`),
          fetch(`${apiUrl}/api/alumni/count`),
          fetch(`${apiUrl}/api/music-sheets/count`),
          // Removed fetch("/api/events/count")
        ]);

        // Check for errors (same as before, but without events)
        if (!membersResponse.ok) {
          const errorData = await membersResponse.json();
          throw new Error(`Failed to fetch members count: ${errorData.message || membersResponse.status}`);
        }
        if (!alumniResponse.ok) {
          const errorData = await alumniResponse.json();
          throw new Error(`Failed to fetch alumni count: ${errorData.message || alumniResponse.status}`);
        }
        if (!musicSheetsResponse.ok) {
          const errorData = await musicSheetsResponse.json();
          throw new Error(`Failed to fetch music sheets count: ${errorData.message || musicSheetsResponse.status}`);
        }

        // Parse responses (same as before, but without events)
        const membersData = await membersResponse.json();
        const alumniData = await alumniResponse.json();
        const musicSheetsData = await musicSheetsResponse.json();

        setDashboardData({
          totalMembers: membersData.count,
          totalAlumni: alumniData.count,
          totalMusicSheets: musicSheetsData.count,
          // Removed upcomingEvents
        });
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred.");
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-maroon-500 to-maroon-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading dashboard data...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center shadow-lg border border-red-200/50 max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 text-md">
          Welcome back! Here's what's happening with your choir community.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800">Total Members</CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">{dashboardData.totalMembers}</div>
            <p className="text-sm text-blue-700">Active choir members</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Total Alumni</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 mb-1">{dashboardData.totalAlumni}</div>
            <p className="text-sm text-emerald-700">Former choir members</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">Music Sheets</CardTitle>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Music className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">{dashboardData.totalMusicSheets}</div>
            <p className="text-sm text-purple-700">Available sheet music</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="border-b border-orange-200/50 bg-gradient-to-r from-white to-orange-0">
            <CardTitle className="text-xl font-bold text-orange-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              Quick Message
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <MessagingSystem />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="border-b border-indigo-200/50 bg-gradient-to-r from-white to-indigo-0">
            <CardTitle className="text-xl font-bold text-indigo-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No recent activities to display</p>
              <p className="text-gray-500 text-sm mt-1">Activities will appear here as they happen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* You can add more sections here as needed */}
    </div>
  )
}