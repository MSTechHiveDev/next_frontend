'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supportService } from '@/lib/integrations/services/support.service';
import { SupportTicket } from '@/lib/integrations/types/support';
import TicketList from '@/components/support/TicketList';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HelpdeskSupportPage() {
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
            toast.error("Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-6 max-w-7xl mx-auto">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Operations / Assistance Node</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Clinical Support Hub
                    </h1>
                </div>
                <button
                    onClick={() => router.push('/helpdesk/support/create')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                    <Plus size={16} /> New Assistance Ticket
                </button>
            </div>

            <div className="max-w-7xl mx-auto">
                <TicketList
                    tickets={tickets}
                    loading={loading}
                    onView={(id) => router.push(`/helpdesk/support/${id}`)}
                />
            </div>
        </div>
    );
}
