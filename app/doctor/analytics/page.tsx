'use client';

import React from 'react';
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

const DashboardCharts = dynamic(() => import('@/components/doctor/DashboardCharts'), { ssr: false });

export default function AnalyticsPage() {
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
          { label: "Patient Retention", value: "84.2%", icon: Target, color: "emerald", trend: "+2.4%" },
          { label: "Avg. Wait Time", value: "14m", icon: Clock, color: "blue", trend: "-4m" },
          { label: "New Registrations", value: "156", icon: Users, color: "indigo", trend: "+18" },
          { label: "Treatment Efficacy", value: "96%", icon: Activity, color: "rose", trend: "Optimum" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-emerald-500 transition-all">
             <div className="flex items-center justify-between mb-4">
               <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                 <stat.icon size={24} />
               </div>
               <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : stat.trend.startsWith('-') ? 'text-rose-600 bg-rose-50' : 'text-blue-600 bg-blue-50'} px-2 py-1 rounded-full`}>
                 {stat.trend.startsWith('+') ? <ArrowUpRight size={10} /> : stat.trend.startsWith('-') ? <TrendingDown size={10} /> : null} {stat.trend}
               </div>
             </div>
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
               <DashboardCharts type="area" />
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

      {/* Success Metrics Matrix */}
      <div className="bg-linear-to-br from-gray-900 to-black p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
               <TrendingUp className="text-emerald-500 mb-6" size={32} />
               <h4 className="text-xl font-black italic tracking-tight mb-2 uppercase">Operational Delta</h4>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Performance has increased by <span className="text-emerald-400">12.5%</span> compared to the previous clinical epoch.</p>
            </div>
            <div>
               <Users className="text-blue-500 mb-6" size={32} />
               <h4 className="text-xl font-black italic tracking-tight mb-2 uppercase">Patient Advocacy</h4>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Net Promoter Score (NPS) is currently at <span className="text-blue-400">88.2</span>, reflecting superior care standards.</p>
            </div>
            <div>
               <BarChart2 className="text-rose-500 mb-6" size={32} />
               <h4 className="text-xl font-black italic tracking-tight mb-2 uppercase">Revenue Scaling</h4>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Practice monetization efficiency is optimized at <span className="text-rose-400">94%</span> efficiency.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
