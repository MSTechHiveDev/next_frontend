'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Megaphone,
  Clock,
  User,
  AlertTriangle,
  Send,
  Calendar,
  Layers
} from 'lucide-react';
import { hospitalAdminService } from '@/lib/integrations/services/hospitalAdmin.service';
import { toast } from 'react-hot-toast';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetRoles: string[];
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  expiryDate?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    targetRoles: ['all'],
    priority: 'medium',
    expiryDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await hospitalAdminService.getAnnouncements();
      setAnnouncements(res.announcements || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hospitalAdminService.createAnnouncement(newAnnouncement);
      toast.success('Notice broadcasted successfully');
      setIsModalOpen(false);
      setNewAnnouncement({
        title: '',
        content: '',
        targetRoles: ['all'],
        priority: 'medium',
        expiryDate: ''
      });
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to broadcast notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to retract this notice?')) return;
    try {
      await hospitalAdminService.deleteAnnouncement(id);
      toast.success('Notice retracted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-100';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'low': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Notice Board</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Manage hospital-wide broadcasts and personnel alerts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" /> New Broadcast
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                  <Megaphone className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Notices</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{announcements.filter(a => a.isActive).length}</h3>
               </div>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">High Priority</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{announcements.filter(a => a.priority === 'high').length}</h3>
               </div>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Send className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Sent</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{announcements.length}</h3>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
             <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
             <input 
                type="text" 
                placeholder="Search announcements..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>
          <div className="flex items-center gap-2">
             <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-blue-500 transition-colors">
                <Filter className="w-4 h-4" />
             </button>
             <button className="p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-blue-500 transition-colors">
                <Layers className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getPriorityStyle(announcement.priority)}`}>
                        {announcement.priority} Priority
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{announcement.title}</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter">
                       <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg">Target: {announcement.targetRoles.join(', ')}</span>
                       <span className="text-gray-400 flex items-center gap-1"><User className="w-3 h-3" /> By {announcement.createdBy?.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 rounded-xl transition-all" title="View Info">
                       <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 rounded-xl transition-all" title="Edit Notice">
                       <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(announcement._id)}
                      className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 rounded-xl transition-all" 
                      title="Delete notice"
                    >
                       <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
               <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-700">
                  <Megaphone className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white italic">Silence on the airwaves</h3>
               <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">No active broadcasts found in the current transmission cycle.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Broadcast New Notice</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure your message for dissemination.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Notice Headline</label>
                  <input 
                    required
                    type="text" 
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="e.g. Critical System Maintenance Scheduled"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Broadcast Details</label>
                  <textarea 
                    required
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="Provide professional and concise information..."
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Target Demographics</label>
                      <select 
                        multiple
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newAnnouncement.targetRoles}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setNewAnnouncement({...newAnnouncement, targetRoles: values});
                        }}
                      >
                        <option value="all">Global (All Personnel)</option>
                        <option value="doctor">Doctors Only</option>
                        <option value="staff">Nursing/General Staff</option>
                        <option value="helpdesk">Reception/Helpdesk</option>
                      </select>
                   </div>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Priority Rating</label>
                        <select 
                          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          value={newAnnouncement.priority}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value as any})}
                        >
                          <option value="low">Standard Awareness</option>
                          <option value="medium">Action Recommended</option>
                          <option value="high">Urgent Response Mandatory</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Auto-Retract Date</label>
                        <input 
                          type="date" 
                          value={newAnnouncement.expiryDate}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, expiryDate: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all"
                >
                  Discard Draft
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
                >
                  Initiate Global Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
