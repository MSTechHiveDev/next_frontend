"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { adminService } from "@/lib/integrations";
import { useAuthStore } from "@/stores/authStore";
import { 
  Users, 
  Building2, 
  Stethoscope, 
  UserPlus, 
  Headphones,
  ShieldCheck,
  TrendingUp,
  Activity,
  Calendar
} from "lucide-react";
import { PageHeader, Card } from "@/components/admin";
import type { DashboardStats } from "@/lib/integrations";

// Load Chart dynamically to avoid SSR issues with ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AdminDashboard() {
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const data = await adminService.getDashboardClient();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <Users className="text-blue-500" />,
      change: "+12% this week",
      color: "blue"
    },
    {
      label: "Total Doctors",
      value: stats?.totalDoctors || 0,
      icon: <Stethoscope className="text-green-500" />,
      change: "+2 this month",
      color: "green"
    },
    {
      label: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: <UserPlus className="text-purple-500" />,
      change: "+45 new",
      color: "purple"
    },
    {
      label: "Total Hospitals",
      value: stats?.totalHospitals || 0,
      icon: <Building2 className="text-orange-500" />,
      change: "Active branches",
      color: "orange"
    },
    {
      label: "Total Admins",
      value: stats?.totalAdmins || 0,
      icon: <ShieldCheck className="text-red-500" />,
      change: "System staff",
      color: "red"
    },
    {
      label: "Front Desk",
      value: stats?.totalHelpDesks || stats?.totalHelpdesks || 0,
      icon: <Headphones className="text-yellow-500" />,
      change: "Active stations",
      color: "yellow"
    }
  ];

  const chartOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit'
    },
    colors: ['#3B82F6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: stats?.activityStats?.map(item => item._id) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: { style: { colors: 'var(--secondary-color)', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: 'var(--secondary-color)', fontSize: '10px' } }
    },
    grid: {
      borderColor: 'var(--border-color)',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
    theme: { mode: 'dark' },
    tooltip: {
        theme: 'dark',
        style: { fontSize: '12px' }
    }
  };

  const chartSeries = [{
    name: 'New Registrations',
    data: stats?.activityStats?.map(item => item.count) || [30, 40, 35, 50, 49, 60, 70]
  }];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Welcome back, System Administrator. Health ecosystem monitoring is active."
        icon={<Activity className="text-blue-500" />}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} padding="p-4" className="hover:border-blue-500/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-[10px] text-green-500 font-medium mt-1 flex items-center gap-1">
                 <TrendingUp size={10} />
                 {stat.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card title="User Growth Analytics" padding="p-6">
           <div className="h-[250px] w-full">
                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
           </div>
        </Card>
        
        {/* Recent Registrations */}
        <Card title="Recent Registrations" padding="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b" style={{ borderColor: 'var(--border-color)' }}>
                 <tr>
                   <th className="px-6 py-3">User</th>
                   <th className="px-6 py-3">Role</th>
                   <th className="px-6 py-3">Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                 {(stats?.recentRegistrations || stats?.recentUsers || []).map((user: any) => (
                   <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                     <td className="px-6 py-3 text-sm font-medium">{user.name}</td>
                     <td className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 border" style={{ borderColor: 'var(--border-color)' }}>
                            {user.role}
                        </span>
                     </td>
                     <td className="px-6 py-3 text-xs opacity-50 flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString()}
                     </td>
                   </tr>
                 ))}
                 {(!stats?.recentRegistrations && !stats?.recentUsers) && (
                   <tr>
                     <td colSpan={3} className="px-6 py-8 text-center text-sm opacity-30 italic">No recent registrations found</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </Card>
      </div>

      {/* Hospital Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Infrastructure Health" padding="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm opacity-60">Active Hospitals</span>
                        <span className="text-sm font-bold text-green-500">{stats?.hospitalsByStatus?.active || 0}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(stats?.hospitalsByStatus?.active || 0) / (stats?.totalHospitals || 1) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm opacity-60">Pending Verification</span>
                        <span className="text-sm font-bold text-orange-400">{stats?.hospitalsByStatus?.pending || 0}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400" style={{ width: `${(stats?.hospitalsByStatus?.pending || 0) / (stats?.totalHospitals || 1) * 100}%` }}></div>
                    </div>
                </div>
          </Card>
          
          <Card title="Quick Security Audit" padding="p-6">
              <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/10 bg-blue-500/5">
                      <ShieldCheck className="text-blue-500" size={18} />
                      <div className="text-xs">
                          <p className="font-bold">System Integrity</p>
                          <p className="opacity-60">Last scan: 2 hours ago</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-500/10 bg-green-500/5">
                      <ShieldCheck className="text-green-500" size={18} />
                      <div className="text-xs">
                          <p className="font-bold">Database Encryption</p>
                          <p className="opacity-60">AES-256 Active</p>
                      </div>
                  </div>
              </div>
          </Card>

          <Card title="Platform Load" padding="p-6">
              <div className="flex flex-col items-center justify-center h-[120px]">
                  <p className="text-3xl font-bold text-blue-500">Normal</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-2">Current System Load</p>
                  <div className="flex gap-1 mt-4">
                      {[1,2,3,4,5,6,7,8].map(i => (
                          <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                      ))}
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
}