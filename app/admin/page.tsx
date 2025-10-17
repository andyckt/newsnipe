"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

interface WaitlistEntry {
  _id: string;
  email: string;
  createdAt: string;
}

interface AnalyticsData {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growth: { date: string; count: number }[];
  };
  snipes: {
    total: number;
    createdToday: number;
    createdThisWeek: number;
    byMode: { name: string; value: number }[];
    byLanguage: { name: string; value: number }[];
  };
  responses: {
    total: number;
    completedToday: number;
    completedThisWeek: number;
    byStatus: { name: string; value: number }[];
    byDecision: { name: string; value: number }[];
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.toUpperCase() === "SNIPE2025") {
      setIsAuthenticated(true);
      fetchAnalyticsData();
    } else {
      setError("Invalid password");
    }
  };

  const fetchWaitlistData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/admin/waitlist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch waitlist data");
      }
      
      const data = await response.json();
      setWaitlistData(data);
    } catch (err) {
      setError("Error fetching waitlist data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/admin/analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError("Error fetching analytics data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "waitlist") {
      fetchWaitlistData();
    } else if (value === "dashboard") {
      fetchAnalyticsData();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {!isAuthenticated ? (
          <Card className="bg-gray-900 border-gray-800 text-white max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-light tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Admin Dashboard</CardTitle>
              <CardDescription className="text-gray-400">Enter your password to access analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                >
                  Login
                </Button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsAuthenticated(false)}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Logout
                </Button>
              </div>
            </div>

            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-gray-700">Dashboard</TabsTrigger>
                <TabsTrigger value="waitlist" className="data-[state=active]:bg-gray-700">Waitlist</TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-gray-700">Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-400 border-r-transparent"></div>
                    <p className="mt-2 text-gray-400">Loading analytics data...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400">
                    {error}
                  </div>
                ) : analyticsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Stats */}
                    <Card className="bg-gray-900 border-gray-800 text-white col-span-1">
                      <CardHeader>
                        <CardTitle>User Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.users.total)}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">New Today</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.users.newToday)}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">This Week</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.users.newThisWeek)}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">This Month</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.users.newThisMonth)}</p>
                          </div>
                        </div>

                        <div className="h-64">
                          <p className="text-sm text-gray-400 mb-2">User Growth</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.users.growth}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                              <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                              <YAxis stroke="#888" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#aaa' }}
                              />
                              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Snipe Stats */}
                    <Card className="bg-gray-900 border-gray-800 text-white col-span-1">
                      <CardHeader>
                        <CardTitle>Snipe Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Snipes</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.snipes.total)}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Created Today</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.snipes.createdToday)}</p>
                          </div>
                        </div>

                        <div className="h-64">
                          <p className="text-sm text-gray-400 mb-2">Snipes by Mode</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.snipes.byMode}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {analyticsData.snipes.byMode.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                                itemStyle={{ color: '#fff' }}
                                formatter={(value, name) => [value, name]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="h-64">
                          <p className="text-sm text-gray-400 mb-2">Snipes by Language</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.snipes.byLanguage}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {analyticsData.snipes.byLanguage.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                                itemStyle={{ color: '#fff' }}
                                formatter={(value, name) => [value, name]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Response Stats */}
                    <Card className="bg-gray-900 border-gray-800 text-white col-span-1">
                      <CardHeader>
                        <CardTitle>Response Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Responses</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.responses.total)}</p>
                          </div>
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Completed Today</p>
                            <p className="text-2xl font-bold">{formatNumber(analyticsData.responses.completedToday)}</p>
                          </div>
                        </div>

                        <div className="h-64">
                          <p className="text-sm text-gray-400 mb-2">Responses by Status</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.responses.byStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {analyticsData.responses.byStatus.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                                itemStyle={{ color: '#fff' }}
                                formatter={(value, name) => [value, name]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="h-64">
                          <p className="text-sm text-gray-400 mb-2">Responses by Decision</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.responses.byDecision}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {analyticsData.responses.byDecision.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                                itemStyle={{ color: '#fff' }}
                                formatter={(value, name) => [value, name]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="waitlist" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-400 border-r-transparent"></div>
                    <p className="mt-2 text-gray-400">Loading waitlist data...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400">
                    {error}
                  </div>
                ) : waitlistData.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                    No waitlist entries found.
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {waitlistData.map((entry) => (
                          <tr key={entry._id} className="hover:bg-gray-800/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{entry.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(entry.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-6 py-3 bg-gray-800/30 text-sm text-gray-400">
                      Total entries: {waitlistData.length}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tools" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader>
                      <CardTitle>Database Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Fix database schema issues</p>
                        <Button 
                          onClick={() => window.location.href = "/admin/fix-schema"}
                          variant="outline"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 w-full"
                        >
                          Fix Schema
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
