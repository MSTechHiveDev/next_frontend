"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
    FileText, 
    Beaker, 
    Search, 
    Navigation, 
    ChevronRight,
    Loader2,
    Activity,
    ArrowLeft,
    RefreshCw,
    Printer,
    ChevronLeft,
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { helpdeskService } from '@/lib/integrations/services/helpdesk.service';
import { generatePrescriptionHtml, generateLabTokenHtml } from '@/lib/print-utils';
import Link from 'next/link';

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function TransitsPage() {
    const [loading, setLoading] = useState(true);
    const [transits, setTransits] = useState<any[]>([]);
    
    // Server-side State
    const [filter, setFilter] = useState<'all' | 'prescription' | 'lab'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [profile, setProfile] = useState<any>(null);

    const fetchTransits = useCallback(async () => {
        setLoading(true);
        try {
            const data = await helpdeskService.getTransits({
                page,
                limit: 10,
                search: debouncedSearch,
                type: filter
            });
            setTransits(data.transits || []);
            setTotalPages(data.pagination?.pages || 1);
            setTotalItems(data.pagination?.total || 0);
        } catch (error: any) {
            console.error('Failed to fetch transits:', error);
            // toast.error("Failed to sync transits");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filter]);

    const fetchProfile = async () => {
        try {
            const res = await helpdeskService.getMe();
            if (res) {
                setProfile(res);
                const hospitalId = res.hospital?._id || res.hospital;
                if (hospitalId) {
                    setupSocket(typeof hospitalId === 'string' ? hospitalId : (hospitalId as any)._id);
                }
            }
        } catch (error) {}
    };

    useEffect(() => {
        fetchTransits();
    }, [fetchTransits]);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [filter, debouncedSearch]);

    const setupSocket = (hospitalId: string) => {
        if (!hospitalId) return;
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002', { withCredentials: true });

        socket.on('connect', () => {
            socket.emit('join_room', { role: 'helpdesk', userId: profile?._id, hospitalId });
        });

        socket.on('new_transit', (data) => {
            toast.success(`NEW TRANSIT: ${data.patientName}`);
            fetchTransits();
        });

        return () => { socket.disconnect(); };
    };

    const handleCollect = async (appointmentId: string) => {
        try {
            await helpdeskService.collectTransit(appointmentId);
            toast.success('Collection Verified');
            fetchTransits();
        } catch (error) {
            toast.error("Collection error");
        }
    };

    const handlePrint = (transit: any, type: 'prescription' | 'lab') => {
        const hospital = profile?.hospital || { name: "CureChain Medical Center", address: "Medical District", contact: "N/A" };
        
        if (type === 'prescription' && transit.prescription) {
             const data = {
                 hospital,
                 patient: {
                     name: transit.patientName,
                     mrn: transit.patientMRN,
                     mobile: transit.patientMobile,
                     age: transit.patientAge,
                     gender: transit.patientGender
                 },
                 doctor: {
                     name: transit.doctorName,
                     specialization: transit.doctorSpecialization,
                     signature: transit.doctorSignature
                 },
                 prescription: transit.prescription
             };
             
             const html = generatePrescriptionHtml(data);
             const win = window.open('', '_blank');
             if (win) {
                 win.document.write(html);
                 win.document.close();
             }
             return;
        } 
        
        if (type === 'lab' && transit.labToken) {
             const data = {
                 hospital,
                 patient: {
                     name: transit.patientName,
                     mrn: transit.patientMRN,
                     // Use captured age/gender if available
                     age: transit.patientAge,
                     gender: transit.patientGender
                 },
                 doctor: {
                     name: transit.doctorName
                 },
                 labToken: transit.labToken
             };
             
             const html = generateLabTokenHtml(data);
             const win = window.open('', '_blank');
             if (win) {
                 win.document.write(html);
                 win.document.close();
             }
             return;
        }
    
        toast.error('Document data unavailable');
    };

    return (
        <div className="space-y-6">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Logistics</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Clinical Document Transits
              </h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Live Feed • {totalItems} Pending Documents</p>
            </div>
          </div>
    
          <div className="max-w-7xl mx-auto space-y-6">
                
                {/* CONTROLS BAR */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg">
                        {[
                            { value: 'all', label: 'All', icon: Navigation },
                            { value: 'prescription', label: 'Prescriptions', icon: FileText },
                            { value: 'lab', label: 'Lab Tokens', icon: Beaker }
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    filter === f.value
                                        ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <f.icon size={12} />
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Name or MRN..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-500 transition-all outline-none text-slate-700"
                        />
                    </div>
                </div>
    
                {/* TABLE LAYOUT */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">MRN</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Documents</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorizing Doctor</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" />
                                                <span className="text-xs text-slate-400 font-medium tracking-wide">Fetching Records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transits.length > 0 ? (
                                    transits.map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                                                        {t.patientName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{t.patientName}</div>
                                                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                            {t.patientAge !== '-' ? `${t.patientAge} Years` : 'Age N/A'} • {t.patientGender}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                 <div className="text-xs font-semibold text-slate-700 font-mono">
                                                    {t.patientMRN}
                                                 </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                               <div className="flex flex-wrap gap-2">
                                                    {(filter === 'all' || filter === 'prescription') && t.prescription && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold uppercase tracking-wide">
                                                            <FileText size={10} /> Prescription
                                                        </span>
                                                    )}
                                                    {(filter === 'all' || filter === 'lab') && t.labToken && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold uppercase tracking-wide">
                                                            <Beaker size={10} /> Lab Token
                                                        </span>
                                                    )}
                                                    {!t.prescription && !t.labToken && (
                                                        <span className="text-xs text-slate-400 italic">No Docs</span>
                                                    )}
                                               </div>
                                               <div className="text-[9px] text-slate-400 mt-2 font-medium">
                                                    Generated: {new Date(t.createdAt).toLocaleDateString()}
                                               </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="text-sm font-medium text-slate-900">Dr. {t.doctorName}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{t.doctorSpecialization}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right align-top">
                                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {(filter === 'all' || filter === 'prescription') && t.prescription && (
                                                        <button 
                                                            onClick={() => handlePrint(t, 'prescription')}
                                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                            title="Print Prescription"
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    )}
                                                    {(filter === 'all' || filter === 'lab') && t.labToken && (
                                                        <button 
                                                            onClick={() => handlePrint(t, 'lab')}
                                                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Print Lab Token"
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleCollect(t._id)}
                                                        className="ml-2 px-4 py-2 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-900/10 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        Collect <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                No transits found for current selection
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* PAGINATION */}
                    <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-teal-600 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-teal-600 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
          </div>
        </div>
    );
}
