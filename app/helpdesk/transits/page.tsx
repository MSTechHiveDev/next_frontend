'use client';

import React, { useState, useEffect } from "react";
import { Truck, MapPin, CheckCircle2, MoreVertical, Plus, Loader2, AlertCircle } from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";

export default function TransitsPage() {
    const [transits, setTransits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransits();
    }, []);

    const fetchTransits = async () => {
        try {
            setLoading(true);
            const allApts = await helpdeskService.getAppointments();
            // We'll treat in-progress appointments as active transits for now
            const transitApts = allApts.filter((a: any) => a.status === 'in-progress');
            setTransits(transitApts);
        } catch (error: any) {
            console.error("Failed to fetch transits:", error);
            toast.error("Failed to sync transit logs");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Scanning Transit Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic">Internal Transits</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Real-time patient redirection and movement logs</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <Plus size={20} /> Initiate Transit
                </button>
            </div>

            <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {transits.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Movement Route</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {transits.map((transit) => (
                                    <tr key={transit._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs">
                                                    {(transit.patient?.name || "P").charAt(0)}
                                                </div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{transit.patient?.name || "Anonymous"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 my-1"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full border border-blue-500"></div>
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                    <p>{transit.hospital?.name || "MAIN WING"}</p>
                                                    <p className="text-blue-500">WARD {transit.room || "C-42"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                transit.status === 'Completed' 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse'
                                            }`}>
                                                {transit.status === 'Completed' ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                                                {transit.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="text-gray-200 w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-black text-gray-300 italic tracking-tight uppercase leading-none">Status Quo</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">No active patient transits detected in the system</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

