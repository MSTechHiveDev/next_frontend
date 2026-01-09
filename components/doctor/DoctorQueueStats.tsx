"use client";

import React from 'react';
import { Users, Clock, TrendingUp, Calendar, ArrowRight, UserCheck } from 'lucide-react';

interface DoctorQueueStatsProps {
  queueCount: number;
  showQueue: boolean;
}

export default function DoctorQueueStats({ queueCount, showQueue }: DoctorQueueStatsProps) {
  // Mock data for demonstration - in real app this would come from API
  const stats = {
    todayTotal: 45,
    completed: 28,
    completionRate: 62,
    avgTime: "12 mins",
    estimatedTime: queueCount * 12
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Quick Summary Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Today's Summary</h3>
              <p className="text-xs text-gray-500">Progress overview</p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">Live</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Booked</p>
            <p className="text-2xl font-black">{stats.todayTotal}</p>
          </div>
          <div className="p-4 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-green-100">
            <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Completed</p>
            <p className="text-2xl font-black">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Estimated Completion Time Card */}
      {showQueue && queueCount > 0 ? (
        <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Estimated Wait</h3>
              <p className="text-xs text-gray-500">Based on {stats.avgTime} avg.</p>
            </div>
          </div>
          
          <div className="flex items-end gap-2 mb-4">
            <p className="text-4xl font-black text-orange-600 dark:text-orange-400">{formatEstimatedTime(stats.estimatedTime)}</p>
            <p className="text-sm font-bold text-orange-400 mb-1">Total</p>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-orange-100 dark:border-orange-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{queueCount} Patients in queue</span>
            </div>
            <ArrowRight size={14} className="text-orange-400" />
          </div>
        </div>
      ) : (
        <div className="bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-700 shadow-sm flex flex-col justify-center text-center items-center">
           <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center mb-4">
              <UserCheck className="text-indigo-600" size={32} />
           </div>
           <h3 className="font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">Queue All Clear</h3>
           <p className="text-xs font-medium text-indigo-400 mt-1 uppercase tracking-widest">System ready for next patient</p>
        </div>
      )}
    </div>
  );
}
