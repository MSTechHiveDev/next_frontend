'use client';

import React from "react";
import { Stethoscope, Search, Phone, MessageSquare } from "lucide-react";
import { helpdeskData } from "@/lib/integrations/data/helpdesk";

export default function DoctorsList() {
    const { doctors } = helpdeskData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Doctors</h1>
                    <p className="text-gray-500">View real-time availability and contact info for hospital specialists.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter by name..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl group-hover:scale-110 transition-transform">
                                <Stethoscope size={32} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-gray-900 dark:text-white">{doc.name}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{doc.specialty}</p>
                                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                    doc.availability === 'Available' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {doc.availability}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-px bg-gray-50 dark:bg-gray-800 w-full" />
                            <div className="flex gap-2">
                                <button className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                                    <Phone size={14} /> Call
                                </button>
                                <button className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                                    <MessageSquare size={14} /> Msg
                                </button>
                            </div>
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/10">
                                View Schedule
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
