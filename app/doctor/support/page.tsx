'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  FileText,
  Paperclip,
  Send,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { createSupportTicketAction, getMyTicketsAction } from '@/lib/integrations/actions/support.actions';
import toast from 'react-hot-toast';
import { SupportTicket } from '@/lib/integrations/types/support';

export default function DoctorSupportPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: '',

    message: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await getMyTicketsAction();
    if (res.success && res.data) {
      setTickets(res.data);
    } else {
      toast.error(res.error || 'Failed to fetch tickets');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (formData.attachments.length + e.target.files.length > 3) {
        toast.error('Maximum 3 attachments allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('type', formData.category);

    data.append('message', formData.message);

    formData.attachments.forEach(file => {
      data.append('attachments', file);
    });

    const res = await createSupportTicketAction(data);

    if (res.success) {
      toast.success('Ticket created successfully');
      setFormData({
        subject: '',
        category: '',

        message: '',
        attachments: []
      });
      setActiveTab('history');
    } else {
      toast.error(res.error || 'Failed to create ticket');
    }
    setSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Support & Helpdesk</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Technical Assistance & Enquiries</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'create'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Plus size={16} /> Raise Ticket
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Clock size={16} /> Ticket History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'create' ? (
            <div className="bg-white dark:bg-gray-800 rounded-4xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <LifeBuoy className="text-emerald-500" /> New Support Request
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide text-[10px]">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief summary of issue"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide text-[10px]">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Select Category</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="bug">Technical Bug</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>



                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide text-[10px]">Description</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide text-[10px]">Attachments (Max 3)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-all group"
                  >
                    <Paperclip className="mx-auto h-8 w-8 text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                    <p className="text-sm text-gray-500">Click to upload files or images</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                          <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded-full"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Send size={18} />
                    )}
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-bold">Loading your tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-4xl p-12 text-center border border-gray-100 dark:border-gray-700">
                  <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Tickets Found</h3>
                  <p className="text-gray-500 mt-2">You haven't raised any support requests yet.</p>
                </div>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket._id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {ticket.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                          {ticket.subject}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {ticket.message}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-4">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${ticket.priority === 'critical' ? 'bg-red-500' :
                          ticket.priority === 'high' ? 'bg-orange-500' :
                            ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                        <span className="uppercase">{ticket.priority} Priority</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}

      </div>
    </div>
  );
}
