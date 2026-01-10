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
        <div className="space-y-6 animate-in fade-in duration-500">
            {viewImage && <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {ticket.status === 'open' ? <Clock size={14} /> : <CheckCircle size={14} />}
                        {ticket.status}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={() => handleStatusChange(ticket.status === 'resolved' ? 'open' : 'resolved')}
                            disabled={resolving}
                            className={`px-5 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${ticket.status === 'resolved'
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {resolving ? 'Updating...' : (ticket.status === 'resolved' ? 'Re-open Ticket' : 'Mark Resolved')}
                        </button>
                    )}
                </div>
            </div>

            {/* Ticket Info Card */}
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{ticket.subject}</h1>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-mono">ID: #{ticket._id.slice(-6).toUpperCase()}</span>
                        <span>•</span>
                        <span className="uppercase">{ticket.category}</span>
                        <span>•</span>
                        <span>{format(new Date(ticket.createdAt), 'PPP p')}</span>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <User size={20} />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{ticket.requester?.name || ticket.name || 'Unknown User'}</p>
                                <p className="text-[10px] uppercase text-gray-400 font-bold">{ticket.requester?.role || ticket.role || 'N/A'}</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{ticket.message}</p>

                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="pt-4 flex gap-4 overflow-x-auto pb-2">
                                {ticket.attachments.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setViewImage(url)}
                                        className="block w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all cursor-zoom-in flex-shrink-0"
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
            <div className="space-y-6">
                {ticket.replies?.map((reply, index) => {
                    const isSupportReply = ['admin', 'super-admin'].includes(reply.sender?.role || '');
                    // If I am Admin (viewing as Admin), Support replies are "Me" (Right).
                    // If I am User (viewing as User), Non-Support replies (my replies) are "Me" (Right).
                    const isMe = isAdmin ? isSupportReply : !isSupportReply;

                    return (
                        <div key={index} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${itemRoleColor(reply.sender?.role || 'user')} text-white shadow-md`}>
                                {isSupportReply ? <ShieldCheck size={14} /> : <User size={14} />}
                            </div>
                            <div className={`max-w-[80%] p-6 rounded-3xl shadow-sm ${isMe
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                                }`}>
                                <div className="flex justify-between items-center gap-8 mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {reply.sender?.name || 'Unknown'} ({reply.sender?.role || 'N/A'})
                                    </span>
                                    <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {format(new Date(reply.createdAt), 'MMM dd, p')}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isMe ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {reply.message}
                                </p>
                                {reply.attachments && reply.attachments.length > 0 && (
                                    <div className={`mt-3 flex flex-wrap gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {reply.attachments.map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setViewImage(url)}
                                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${isMe ? 'border-white/30' : 'border-gray-200'} transition-transform hover:scale-105`}
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
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium p-2 dark:text-white"
                            placeholder="Type your reply..."
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(e)}
                        />
                        <button
                            onClick={handleReply}
                            disabled={sending || (!replyMessage.trim() && replyFiles.length === 0)}
                            className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            {sending ? <Clock size={20} className="animate-spin" /> : <Send size={20} />}
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
    if (isAdminRole(role)) return 'bg-blue-600';
    if (role === 'doctor') return 'bg-teal-500';
    if (role === 'hospital-admin') return 'bg-purple-600';
    return 'bg-gray-500';
}

interface ImageViewerProps {
    src: string;
    onClose: () => void;
}

function ImageViewer({ src, onClose }: ImageViewerProps) {
    if (!src) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
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
