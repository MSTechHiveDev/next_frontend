'use client';

import React, { useState, useEffect } from "react";
import { 
    Stethoscope, 
    Search, 
    Phone, 
    MessageSquare, 
    Loader2, 
    AlertCircle, 
    RefreshCw,
    ArrowLeft,
    Activity,
    Calendar,
    ChevronRight,
    HeartPulse
} from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DoctorsList() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchDoctors = async () => {
        try {
            if (loading) setLoading(true);
            const data = await helpdeskService.getDoctors();
            const validDoctors = data.filter((doc: any) => (doc.user?.name && doc.user.name !== 'Unknown') || (doc.name && doc.name !== 'Unknown'));
            setDoctors(validDoctors);
        } catch (error: any) {
            toast.error("Physician Link Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const filteredDoctors = doctors.filter(doc => {
        const name = (doc.user?.name || doc.name || "").toLowerCase();
        const specialty = (doc.specialties?.[0] || doc.specialty || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || specialty.includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* PROFESSIONAL HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                        <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                            <ArrowLeft size={16} />
                        </Link>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Personnel / Active Duty Matrix</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Physician Registry Control
                    </h1>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Hospital Node / Provider Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="FILTER PROVIDERS..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-tight outline-none shadow-sm focus:border-teal-500 transition-all"
                            aria-label="Filter physicians"
                        />
                    </div>
                    <button onClick={fetchDoctors} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 transition-all shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* DOCTORS GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => {
                    const name = (doc.user?.name || doc.name || "Dr. Anonymous").toUpperCase();
                    const specialty = (doc.specialties?.[0] || doc.specialty || "General Medicine").toUpperCase();
                    const status = doc.user?.status || "active";
                    
                    return (
                        <div key={doc._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all group flex flex-col gap-6 h-full hover:border-teal-500/30">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl uppercase shadow-sm border border-teal-100 shrink-0">
                                        {name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{name}</h3>
                                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-0.5 truncate">{specialty}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border shrink-0 ${
                                    status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                    {status === 'active' ? 'Available' : 'Off Duty'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 flex-1">
                                <InfoBox icon={<HeartPulse size={12} className="text-rose-500" />} label="Status" value="Clinic Duty" />
                                <InfoBox icon={<Activity size={12} className="text-teal-600" />} label="Shift" value="General" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                      <button className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm" aria-label={`Call ${name}`}>
                                        <Phone size={14} /> Call
                                    </button>
                                    <button className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm" aria-label={`Message ${name}`}>
                                        <MessageSquare size={14} /> Message
                                    </button>
                                </div>
                                <button className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 group">
                                    Deployment Schedule <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Physician Object Bound</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoBox({ icon, label, value }: any) {
    return (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">{icon} {label}</span>
            <span className="text-[10px] font-bold text-slate-700 uppercase">{value}</span>
        </div>
    );
}
