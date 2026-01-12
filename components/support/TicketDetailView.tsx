'use client';

import React, { useState, useEffect } from 'react';
import { supportService } from '@/lib/integrations/services/support.service';
import { SupportTicket } from '@/lib/integrations/types/support';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, Clock, Paperclip, User, ShieldCheck, X } from 'lucide-react';
import { format } from 'date-fns';

interface TicketDetailViewProps {
    ticketId: string;
    isAdmin?: boolean;
    onBack: () => void;
}

export default function TicketDetailView({ ticketId, isAdmin, onBack }: TicketDetailViewProps) {
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [resolving, setResolving] = useState(false);
    const [viewImage, setViewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const data = await supportService.getTicketDetails(ticketId);
            console.log("Fetched Ticket Data:", data); // Debug Log
            if (data.attachments) {
                console.log("Attachments:", data.attachments);
            }
            setTicket(data);
        } catch (error) {
            toast.error("Failed to load ticket details");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setSending(true);
        const formData = new FormData();
        formData.append('message', replyMessage);

        replyFiles.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            await supportService.replyToTicket(ticketId, formData);
            toast.success("Reply sent");
            setReplyMessage('');
            setReplyFiles([]);
            fetchTicket(); // Refresh conversation
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        const action = newStatus === 'resolved' ? 'mark this ticket as resolved' : 're-open this ticket';
        if (!confirm(`Are you sure you want to ${action}?`)) return;

        setResolving(true);
        try {
            await supportService.updateStatus(ticketId, newStatus);
            toast.success(`Ticket ${newStatus === 'resolved' ? 'resolved' : 're-opened'}`);
            fetchTicket();
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setResolving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400">Loading details...</div>;
    if (!ticket) return <div className="p-20 text-center text-red-400">Ticket not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                        <button onClick={onBack} className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                            <ArrowLeft size={16} />
                        </button>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Operations / Assistance Node</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Clinical Assistance Stream
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${ticket.status === 'open' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {ticket.status === 'open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {ticket.status}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={() => handleStatusChange(ticket.status === 'resolved' ? 'open' : 'resolved')}
                            disabled={resolving}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 text-white ${ticket.status === 'resolved'
                                ? 'bg-slate-900 hover:bg-slate-800'
                                : 'bg-teal-600 hover:bg-teal-700 font-sans'
                                }`}
                        >
                            {resolving ? 'Syncing...' : (ticket.status === 'resolved' ? 'Re-open Channel' : 'Mark Resolved')}
                        </button>
                    )}
                </div>
            </div>

            {/* Ticket Info Card */}
            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase mb-2">{ticket.subject}</h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">ID: #{ticket._id.slice(-6).toUpperCase()}</span>
                        <span>•</span>
                        <span>CATEGORY: {ticket.category}</span>
                        <span>•</span>
                        <span>{format(new Date(ticket.createdAt), 'PPP p')}</span>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm relative font-sans">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-sm">
                        <User size={20} />
                    </div>
                    <div className="space-y-3 flex-1">
                        <div>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{ticket.requester?.name || ticket.name || 'Unknown User'}</p>
                            <p className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">{ticket.requester?.role || ticket.role || 'N/A'}</p>
                        </div>
                        <p className="text-slate-600 text-[11px] font-medium leading-relaxed whitespace-pre-wrap">{ticket.message}</p>

                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="pt-4 flex gap-4 overflow-x-auto pb-2">
                                {ticket.attachments.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setViewImage(url)}
                                        className="block w-24 h-24 rounded-xl overflow-hidden border border-slate-200 hover:border-teal-500 transition-all cursor-zoom-in shrink-0"
                                    >
                                        <img src={url} alt="attachment" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Conversation History */}
            <div className="space-y-6 px-4">
                {ticket.replies?.map((reply, index) => {
                    const isSupportReply = ['admin', 'super-admin'].includes(reply.sender?.role || '');
                    const isMe = isAdmin ? isSupportReply : !isSupportReply;

                    return (
                        <div key={index} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${itemRoleColor(reply.sender?.role || 'user')} text-white shadow-sm`}>
                                {isSupportReply ? <ShieldCheck size={14} /> : <User size={14} />}
                            </div>
                            <div className={`max-w-[85%] p-5 rounded-2xl shadow-sm font-sans ${isMe
                                ? 'bg-slate-900 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 rounded-tl-none'
                                }`}>
                                <div className="flex justify-between items-center gap-8 mb-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                                        {reply.sender?.name || 'Unknown'} ({reply.sender?.role || 'N/A'})
                                    </span>
                                    <span className={`text-[9px] font-bold ${isMe ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {format(new Date(reply.createdAt), 'MMM dd, p')}
                                    </span>
                                </div>
                                <p className={`text-[11px] font-medium leading-relaxed whitespace-pre-wrap ${isMe ? 'text-slate-100' : 'text-slate-600'}`}>
                                    {reply.message}
                                </p>
                                {reply.attachments && reply.attachments.length > 0 && (
                                    <div className={`mt-4 flex flex-wrap gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {reply.attachments.map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setViewImage(url)}
                                                className={`w-16 h-16 rounded-lg overflow-hidden border ${isMe ? 'border-slate-800' : 'border-slate-100'} transition-transform hover:scale-105`}
                                            >
                                                <img src={url} alt="attachment" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reply Input Area */}
            {ticket.status !== 'resolved' && (
                <div className="bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 sticky bottom-6 z-20">

                    {/* File Previews */}
                    {replyFiles.length > 0 && (
                        <div className="flex gap-3 px-4 pt-3 pb-1 overflow-x-auto">
                            {replyFiles.map((file, i) => (
                                <div key={i} className="relative group shrink-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="preview"
                                            className="w-full h-full object-cover opacity-80"
                                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setReplyFiles(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full shadow-sm hover:scale-110 transition-transform"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <label className="p-4 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                            <Paperclip size={20} />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const newFiles = Array.from(e.target.files);
                                        if (replyFiles.length + newFiles.length > 3) {
                                            toast.error("Max 3 images allowed");
                                            return;
                                        }
                                        setReplyFiles(prev => [...prev, ...newFiles]);
                                        e.target.value = ''; // Reset input
                                    }
                                }}
                            />
                        </label>

                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-xs font-bold p-2 text-slate-900 uppercase tracking-tight"
                            placeholder="Type your clinical update..."
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(e)}
                        />
                        <button
                            onClick={handleReply}
                            disabled={sending || (!replyMessage.trim() && replyFiles.length === 0)}
                            className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-teal-900/20"
                        >
                            {sending ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function isAdminRole(role: string) {
    return ['admin', 'super-admin'].includes(role);
}

function itemRoleColor(role: string) {
    if (isAdminRole(role)) return 'bg-slate-900';
    if (role === 'doctor') return 'bg-teal-600';
    if (role === 'hospital-admin') return 'bg-indigo-600';
    return 'bg-slate-400';
}

interface ImageViewerProps {
    src: string;
    onClose: () => void;
}

function ImageViewer({ src, onClose }: ImageViewerProps) {
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="relative max-w-5xl max-h-[90vh] w-full p-4 flex items-center justify-center">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
                <img
                    src={src}
                    alt="Full View"
                    className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
}
