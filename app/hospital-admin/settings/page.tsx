'use client';

import React from 'react';
import { Settings, Shield, Bell, Eye, Building2, Lock, Users, Activity } from 'lucide-react';
import Link from 'next/link';

interface SettingItem {
  label: string;
  desc: string;
  action?: string;
  status?: string;
  isToggle?: boolean;
  value?: boolean;
}

interface SettingSection {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

export default function HospitalAdminSettings() {
  const settingsSections: SettingSection[] = [
    {
      title: "Hospital Security",
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      items: [
        { label: "Access Control", desc: "Manage administrative roles and permissions", action: "Manage" },
        { label: "Data Encryption", desc: "Configure system-wide encryption protocols", action: "Active", status: "success" }
      ]
    },
    {
      title: "Operational Config",
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      items: [
        { label: "Facility Parameters", desc: "Update hospital-wide service configurations", action: "Update" },
        { label: "Resource Allocation", desc: "Optimized staffing and equipment logic", isToggle: true, value: true }
      ]
    },
    {
      title: "System Logs",
      icon: <Activity className="w-5 h-5 text-rose-600" />,
      items: [
        { label: "Audit Frequency", desc: "Logging interval for system events", action: "Real-time" },
        { label: "Automated Reporting", desc: "Generate daily performance metrics", isToggle: true, value: true }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Institutional Config</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <Settings className="w-4 h-4" /> Hospital-Wide System Parameters
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {settingsSections.map((section, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center gap-4 bg-gray-50/30 dark:bg-gray-800/20">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                {section.icon}
              </div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">{section.title}</h3>
            </div>
            
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {section.items.map((item, i) => (
                <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white uppercase text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1 tracking-wide">{item.desc}</p>
                  </div>
                  
                  {item.isToggle ? (
                    <button className={`w-12 h-6 rounded-full transition-all relative ${item.value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.value ? 'right-1' : 'left-1'}`} />
                    </button>
                  ) : (
                    <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                      item.status === 'success' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-blue-200 hover:text-blue-600'
                    }`}>
                      {item.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-linear-to-r from-blue-900 to-indigo-950 rounded-[2.5rem] text-white flex items-center justify-between group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl -mt-20 -mr-20 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="relative z-10">
          <h4 className="text-xl font-black uppercase italic tracking-tighter">Hospital Profile</h4>
          <p className="text-gray-300 text-xs font-bold mt-1 uppercase tracking-widest">Update institutional information and branding</p>
        </div>
        <Link href="/hospital-admin/profile" className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 hover:text-white transition-all active:scale-95 relative z-10 shadow-2xl">
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
