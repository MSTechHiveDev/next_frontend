'use client';

import React, { useState, useEffect } from "react";
import { Stethoscope, Search, Phone, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";

export default function DoctorsList() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await helpdeskService.getDoctors();
            console.log('[Doctors] Received data from backend:', data);
            console.log('[Doctors] Sample doctor structure:', data[0]);
            console.log('[Doctors] Total doctors:', data.length);
            
            // Filter out doctors without valid names
            const validDoctors = data.filter((doc: any) => {
                const hasValidName = (doc.user?.name && doc.user.name !== 'Unknown') || 
                                    (doc.name && doc.name !== 'Unknown');
                return hasValidName;
            });
            
            console.log('[Doctors] Filtered to valid doctors:', validDoctors.length);
            
            // Log each valid doctor's name resolution
            validDoctors.forEach((doc: any, index: number) => {
                const name = doc.user?.name || doc.name || "Unknown";
                console.log(`[Doctors] Doctor ${index}:`, {
                    id: doc._id,
                    userName: doc.user?.name,
                    directName: doc.name,
                    resolvedName: name,
                    hasUser: !!doc.user,
                    specialty: doc.specialties?.[0] || doc.specialty
                });
            });
            
            setDoctors(validDoctors);
        } catch (error: any) {
            console.error("Failed to fetch doctors:", error);
            toast.error(error.message || "Failed to load medical personnel");
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const name = doc.user?.name || doc.name || "";
        const specialty = (doc.specialties?.[0] || doc.specialty || "").toLowerCase();
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               specialty.includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Physician Matrix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic">Hospital Doctors</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time availability and contact records</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="FILTER BY NAME OR SPECIALTY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doc) => {
                        const name = doc.user?.name || doc.name || "Unknown";
                        const specialty = doc.specialties?.[0] || doc.specialty || "General Medicine";
                        const status = doc.user?.status || "active";
                        
                        return (
                            <div key={doc._id} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl group-hover:scale-110 transition-transform">
                                        <Stethoscope size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">{name}</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">{specialty}</p>
                                        <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                                            status === 'active' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {status === 'active' ? 'Available' : 'Unavailable'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-px bg-gray-50 dark:bg-gray-800 w-full" />
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                                            <Phone size={14} /> Call
                                        </button>
                                        <button className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                                            <MessageSquare size={14} /> Msg
                                        </button>
                                    </div>
                                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/10 active:scale-95">
                                        View Schedule
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No medical personnel matching criteria.</p>
                </div>
            )}
        </div>
    );
}

