import React from 'react';
import { SupportTicket } from '@/lib/integrations/types/support';
import { Eye, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';

interface TicketListProps {
    tickets: SupportTicket[];
    isAdmin?: boolean;
    onView: (id: string) => void;
    loading?: boolean;
}

export default function TicketList({ tickets, isAdmin, onView, loading }: TicketListProps) {
    const [activeTab, setActiveTab] = React.useState('Unresolved');
    const [search, setSearch] = React.useState('');

    const filteredTickets = React.useMemo(() => {
        if (!tickets) return [];
        return tickets.filter(ticket => {
            if (activeTab === 'Resolved' && !['resolved', 'closed'].includes(ticket.status)) return false;
            const ticketType = (ticket.type || ticket.category || '').toLowerCase();

            if (activeTab === 'Unresolved' && (['resolved', 'closed'].includes(ticket.status) || ticketType === 'feedback')) return false;
            if (activeTab === 'Feedback' && ticketType !== 'feedback') return false;

            if (search.trim() === '') return true;
            const searchLower = search.toLowerCase();
            return (
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.message.toLowerCase().includes(searchLower) ||
                (ticket.requester?.name || ticket.name || '').toLowerCase().includes(searchLower)
            );
        });
    }, [tickets, activeTab, search]);

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Support Stream...</p>
                </div>
            </div>
        );
    }

    const tabs = ['Unresolved', 'Resolved', 'Feedback'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200">
                <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-white text-teal-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search ticket subjects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-tight outline-none focus:border-teal-500 transition-all"
                    />
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <User size={32} className="text-slate-200 mb-3" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Assistance Tickets Synchronized</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {isAdmin && (
                                    <>
                                        <th className="py-4 px-6">Requester</th>
                                        <th className="py-4 px-6">Role</th>
                                    </>
                                )}
                                <th className="py-4 px-6">Subject Matrix</th>
                                <th className="py-4 px-6">Clinical Category</th>
                                <th className="py-4 px-6">Sync State</th>
                                <th className="py-4 px-6">Received At</th>
                                <th className="py-4 px-6 text-right">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket._id} className="group hover:bg-slate-50 transition-colors">
                                    {isAdmin && (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-slate-900 uppercase">
                                                        {ticket.requester?.name || ticket.name || 'Unknown User'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-medium">
                                                        {ticket.requester?.email || 'No Email'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500`}>
                                                    {ticket.requester?.role || ticket.role || 'N/A'}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    <td className="py-4 px-6">
                                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{ticket.subject}</p>
                                        <p className="text-[10px] text-slate-400 line-clamp-1">{ticket.message}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <CategoryBadge category={ticket.type || ticket.category} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={ticket.status} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-600">
                                                {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {ticket.createdAt ? format(new Date(ticket.createdAt), 'hh:mm a') : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => onView(ticket._id)}
                                            className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <Eye size={14} /> Open
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function CategoryBadge({ category }: { category: string }) {
    const normalize = (str: string) => str?.toLowerCase().trim() || '';
    let style = 'bg-slate-50 text-slate-400 border border-slate-100';

    if (normalize(category) === 'complaint') style = 'bg-rose-50 text-rose-600 border border-rose-100';
    else if (normalize(category) === 'bug') style = 'bg-rose-50 text-rose-600 border border-rose-100';
    else if (normalize(category) === 'feedback') style = 'bg-teal-50 text-teal-600 border border-teal-100';
    else if (normalize(category) === 'inquiry') style = 'bg-slate-50 text-slate-600 border border-slate-200';

    return (
        <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${style}`}>
            {category || 'Node'}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalize = (str: string) => str?.toLowerCase().trim() || '';
    let style = 'bg-slate-50 text-slate-400 border border-slate-100';
    let Icon = AlertCircle;

    if (normalize(status) === 'open') {
        style = 'bg-rose-50 text-rose-600 border border-rose-100';
    } else if (normalize(status) === 'in-progress' || normalize(status) === 'in progress') {
        style = 'bg-teal-50 text-teal-600 border border-teal-100';
        Icon = Clock;
    } else if (normalize(status) === 'resolved') {
        style = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        Icon = CheckCircle;
    } else if (normalize(status) === 'closed') {
        style = 'bg-slate-100 text-slate-500 border border-slate-200';
        Icon = CheckCircle;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${style}`}>
            <Icon size={10} />
            {status}
        </span>
    );
}
