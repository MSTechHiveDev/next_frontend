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

    console.log('TicketList Tickets Data:', tickets); // Debug log

    const filteredTickets = React.useMemo(() => {
        if (!tickets) return [];
        return tickets.filter(ticket => {
            // Filter by Status Tab
            if (activeTab === 'Resolved' && !['resolved', 'closed'].includes(ticket.status)) return false;
            const ticketType = (ticket.type || ticket.category || '').toLowerCase();

            // Unresolved should typically show Open/In-Progress. 
            // The user requested "feedback separately", so 'Unresolved' often excludes Feedback type.
            if (activeTab === 'Unresolved' && (['resolved', 'closed'].includes(ticket.status) || ticketType === 'feedback')) return false;
            if (activeTab === 'Feedback' && ticketType !== 'feedback') return false;

            // Search Filter
            if (search.trim() === '') return true;
            const searchLower = search.toLowerCase();
            return (
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.message.toLowerCase().includes(searchLower) ||
                (ticket.requester?.name || ticket.name || '').toLowerCase().includes(searchLower) ||
                (ticket.requester?.email || '').toLowerCase().includes(searchLower)
            );
        });
    }, [tickets, activeTab, search]);

    if (loading) {
        return <div className="p-10 text-center text-gray-400">Loading support data...</div>;
    }

    const tabs = ['Unresolved', 'Resolved', 'Feedback'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                    <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-full mb-6">
                        <User size={48} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tickets found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                {isAdmin && (
                                    <>
                                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">User</th>
                                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">Role</th>
                                    </>
                                )}
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">Subject</th>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">Type</th>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
                                <th className="text-left py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</th>
                                <th className="text-right py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    {isAdmin && (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {ticket.requester?.name || ticket.name || 'Unknown User'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {ticket.requester?.email || 'No Email'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`}>
                                                    {ticket.requester?.role || ticket.role || 'N/A'}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{ticket.subject}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{ticket.message}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <CategoryBadge category={ticket.type || ticket.category} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={ticket.status} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-500">
                                                {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {ticket.createdAt ? format(new Date(ticket.createdAt), 'hh:mm a') : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => onView(ticket._id)}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <Eye size={14} /> View
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

    let style = 'bg-gray-100 text-gray-600'; // Default

    if (normalize(category) === 'complaint') style = 'bg-orange-100 text-orange-600';
    else if (normalize(category) === 'bug') style = 'bg-red-100 text-red-600';
    else if (normalize(category) === 'feedback') style = 'bg-blue-100 text-blue-600';
    else if (normalize(category) === 'inquiry') style = 'bg-purple-100 text-purple-600';

    return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${style}`}>
            {category || 'N/A'}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalize = (str: string) => str?.toLowerCase().trim() || '';

    let style = 'bg-gray-100 text-gray-500';
    let Icon = AlertCircle;

    if (normalize(status) === 'open') {
        style = 'bg-orange-50 text-orange-600 border border-orange-100';
    } else if (normalize(status) === 'in-progress' || normalize(status) === 'in progress') {
        style = 'bg-blue-50 text-blue-600 border border-blue-100';
        Icon = Clock;
    } else if (normalize(status) === 'resolved') {
        style = 'bg-green-50 text-green-600 border border-green-100';
        Icon = CheckCircle;
    } else if (normalize(status) === 'closed') {
        style = 'bg-gray-100 text-gray-600 border border-gray-200';
        Icon = CheckCircle;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${style}`}>
            <Icon size={12} />
            {status}
        </span>
    );
}
