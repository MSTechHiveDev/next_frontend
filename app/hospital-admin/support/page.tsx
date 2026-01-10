'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supportService } from '@/lib/integrations/services/support.service';
import { SupportTicket } from '@/lib/integrations/types/support';
import TicketList from '@/components/support/TicketList';
import { LifeBuoy, Plus, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HospitalAdminSupportPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const data = await supportService.getMyTickets();
            setTickets(data);
        } catch (error) {
            toast.error("Failed to retrieve protocol logs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header Tier */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Support Matrix</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px] ml-1 flex items-center gap-2">
                        <LifeBuoy className="w-3 h-3 text-blue-500" />
                        System Diagnostics & Inquiry Interface
                    </p>
                </div>
                <button
                    onClick={() => router.push('/hospital-admin/support/create')}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
                >
                    <Plus size={16} /> Initialize Ticket
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px]">
                <div className="bg-blue-600 h-2 w-full"></div>
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic underline decoration-blue-500/30 decoration-4 underline-offset-8">Active Protocols</h3>
                    </div>

                    <TicketList
                        tickets={tickets}
                        loading={loading}
                        onView={(id) => router.push(`/hospital-admin/support/${id}`)}
                    />
                </div>
            </div>
        </div>
    );
}
