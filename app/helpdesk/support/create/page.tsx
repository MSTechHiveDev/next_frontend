'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreateTicketForm from '@/components/support/CreateTicketForm';
import { ArrowLeft } from 'lucide-react';

export default function HelpdeskCreateTicketPage() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => router.back()} className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                            <ArrowLeft size={16} />
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Operations / Assistance Node</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Initiate Assistance Ticket
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <CreateTicketForm basePath="/helpdesk/support" />
            </div>
        </div>
    );
}
