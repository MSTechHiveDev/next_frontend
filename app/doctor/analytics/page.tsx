'use client';

import React, { useState, useEffect } from 'react';
import {
   Activity,
   BarChart2,
   TrendingUp,
   Users,
   Calendar,
   Clock,
   Target,
   ArrowUpRight,
   TrendingDown,
   PieChart as PieIcon,
   Filter,
   Download
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { getDoctorDashboardAction, getDoctorWeeklyStatsAction } from '@/lib/integrations/actions/doctor.actions';
import toast from 'react-hot-toast';

const DashboardCharts = dynamic(() => import('@/components/doctor/DashboardCharts'), { ssr: false });

export default function AnalyticsPage() {
   const [stats, setStats] = useState<any>({
      retention: "84.2%",
      waitTime: "14m",
      registrations: "0",
      efficacy: "96%"
   });
   const [chartData, setChartData] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      setLoading(true);
      try {
         const [dashboardRes, weeklyRes] = await Promise.all([
            getDoctorDashboardAction(),
            getDoctorWeeklyStatsAction()
         ]);

         if (dashboardRes.success && dashboardRes.data) {
            setStats((prev: any) => ({
               ...prev,
               registrations: dashboardRes.data?.stats.totalPatients?.toString() || "0"
            }));
         }

         if (weeklyRes.success && weeklyRes.data) {
            // Map weekly stats to chart format
            // Backend returns generic structure, we adapt it
            const rawData = Array.isArray(weeklyRes.data) ? weeklyRes.data : [];
            if (rawData.length > 0) {
               const mappedData = rawData.map((d: any) => ({
                  name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                  count: d.count || d.appointments || 0
               }));
               setChartData(mappedData);
            }
         }

      } catch (error) {
         console.error("Analytics load error", error);
         toast.error("Failed to load some analytics data");
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="flex h-[50vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
   }

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Practice Analytics</h1>
               <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Strategic Clinical Insights & Performance Metrics</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-black hover:bg-gray-50 transition-all shadow-sm">
                  <Filter size={18} /> Interval: Last 30 Days
               </button>
               <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 dark:shadow-none">
                  <Download size={18} /> Export Intel
               </button>
            </div>
         </div>

         {/* Primary Analytics Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
               { label: "Patient Retention", value: stats.retention, icon: Target, color: "emerald", trend: "+2.4%" },
               { label: "Avg. Wait Time", value: stats.waitTime, icon: Clock, color: "blue", trend: "-4m" },
               { label: "New Registrations", value: stats.registrations, icon: Users, color: "indigo", trend: "+18" },
               { label: "Treatment Efficacy", value: stats.efficacy, icon: Activity, color: "rose", trend: "Optimum" }
            ].map((stat, i) => (
               <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-emerald-500 transition-all">
               
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{stat.value}</h3>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Patient Flux Analysis */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-10 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Clinical Load Flux</h3>
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Personnel through-put over time</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-black text-gray-400 uppercase">Consultations</span>
                     </div>
                  </div>
               </div>
               <div className="h-[400px]">
                  <DashboardCharts type="area" data={chartData} />
               </div>
            </div>

            {/* Demographic Index */}
            <div className="bg-white dark:bg-gray-800 p-10 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2">Demographic Index</h3>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">Patient classification density</p>

               <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                  <div className="w-48 h-48 rounded-full border-16 border-emerald-500/20 flex items-center justify-center relative shadow-2xl shadow-emerald-100 dark:shadow-none">
                     <div className="text-center">
                        <p className="text-4xl font-black text-gray-900 dark:text-white">65%</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Female Majority</p>
                     </div>
                     <div className="absolute inset-0 rounded-full border-t-16 border-emerald-500 animate-[spin_3s_linear_infinite] pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                  </div>

                  <div className="w-full space-y-4">
                     {[
                        { label: "Adult (18-45)", value: 45, color: "emerald" },
                        { label: "Senior (45+)", value: 30, color: "blue" },
                        { label: "Junior (0-17)", value: 25, color: "amber" }
                     ].map((item, i) => (
                        <div key={i}>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                              <span className="text-xs font-black text-gray-900 dark:text-white">{item.value}%</span>
                           </div>
                           <div className="h-2 bg-gray-50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                              <div className={`h-full bg-${item.color}-500 transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
