'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  MoreHorizontal, 
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  List,
  Search,
  Filter,
  CheckCircle2,
  Settings2
} from 'lucide-react';

const shifts = [
  { id: 1, name: 'Morning Shift', time: '08:00 AM - 04:00 PM', staff: 24, status: 'Active', color: 'blue' },
  { id: 2, name: 'Evening Shift', time: '04:00 PM - 12:00 AM', staff: 18, status: 'Active', color: 'indigo' },
  { id: 3, name: 'Night Shift', time: '12:00 AM - 08:00 AM', staff: 12, status: 'Active', color: 'slate' },
  { id: 4, name: 'General Shift', time: '09:00 AM - 05:00 PM', staff: 32, status: 'Active', color: 'emerald' },
];

export default function ShiftManagement() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shift Architecture</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Configure and monitor workforce deployment cycles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none">
            <Plus className="w-5 h-5" /> Initialize shift
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search shift configurations..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none shadow-sm rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex items-center gap-2 px-5 py-4 bg-white dark:bg-gray-800 text-gray-400 border-none shadow-sm rounded-2xl text-sm font-bold hover:text-blue-500 transition-all group">
            <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Advanced Sort
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 text-gray-400 border-none shadow-sm rounded-2xl hover:text-blue-500 transition-all">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {shifts.map((shift) => (
            <div key={shift.id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col group hover:border-blue-500 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-8">
                <button className="text-gray-300 hover:text-gray-600 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className={`w-14 h-14 rounded-2xl bg-${shift.color}-50 dark:bg-${shift.color}-900/20 flex items-center justify-center text-${shift.color}-600 dark:text-${shift.color}-400 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <Clock className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{shift.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{shift.time}</p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-tighter">{shift.staff} Assigned</span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + shift.id * 10}`} alt="Staff" />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-600">
                      +{shift.staff - 3}
                    </div>
                  </div>
                </div>
                
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer">
                  Sync configurations <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* New Shift Placeholder */}
          <button className="bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-4 group hover:border-blue-500 transition-all min-h-[350px]">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm">
              <Plus className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-tighter">Add shift module</h3>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-1">Define new operational timeline</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Linear Shift Matrix</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">v4.0.2 Stable</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/30">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Codename</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeframe</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilization</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {shifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${shift.color}-500/10 flex items-center justify-center text-${shift.color}-500`}>
                           <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">{shift.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-gray-500">{shift.time}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                           <div className={`h-full bg-${shift.color}-500 w-[${(shift.staff/40)*100}%] animate-in slide-in-from-left duration-1000`} style={{ width: `${(shift.staff/40)*100}%` }}></div>
                        </div>
                        <span className="text-xs font-black text-gray-400">{shift.staff} personnel</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Synced</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                         <Settings2 className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integration Status Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
          <ShieldCheck className="w-12 h-12 absolute -bottom-2 -right-2 opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Encryption Level</h4>
          <p className="text-2xl font-black">Military Grade</p>
          <p className="text-[10px] font-bold mt-2 opacity-60">AES-256 standard enforced on all shift data</p>
        </div>
        
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-200 dark:shadow-none relative overflow-hidden group">
          <Zap className="w-12 h-12 absolute -bottom-2 -right-2 opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Network Latency</h4>
          <p className="text-2xl font-black">12ms Response</p>
          <p className="text-[10px] font-bold mt-2 opacity-60">Direct fiber backbone to central database</p>
        </div>

        <div className="bg-slate-800 dark:bg-gray-800 p-6 rounded-3xl text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group border border-slate-700">
          <Users className="w-12 h-12 absolute -bottom-2 -right-2 opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Backup Redundancy</h4>
          <p className="text-2xl font-black">3 Tier Replication</p>
          <p className="text-[10px] font-bold mt-2 opacity-60">Active/Active failover in 3 geo-locations</p>
        </div>
      </div>
    </div>
  );
}
