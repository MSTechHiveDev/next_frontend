'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  AlertTriangle,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { doctorService } from '@/lib/integrations';
import toast from 'react-hot-toast';

export default function DoctorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getAnnouncements();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'low': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-theme"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            Hospital Announcements
            {announcements.filter(a => a.priority === 'high').length > 0 && (
              <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Urgent
              </span>
            )}
          </h1>
          <p className="text-muted mt-1">Stay updated with the latest news, guidelines, and events from the hospital administration.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search announcements..."
              className="bg-card border border-border-theme rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-theme w-48 md:w-64"
            />
          </div>
          <button className="p-2.5 bg-card border border-border-theme rounded-xl hover:bg-secondary-theme transition-colors text-muted">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured / Important Section */}
      {announcements.some(a => a.priority === 'high') && (
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl hover:shadow-indigo-500/20 transition-all group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-8 h-8 text-indigo-100" />
            </div>
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-1">Featured Announcement</p>
              <h2 className="text-2xl font-bold">{announcements.find(a => a.priority === 'high')?.title}</h2>
              <p className=" text-indigo-50/80 mt-2 max-w-2xl text-sm leading-relaxed line-clamp-2">
                {announcements.find(a => a.priority === 'high')?.content}
              </p>
            </div>
            <button className="md:ml-auto px-6 py-3 bg-white text-indigo-950 font-bold rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-lg flex items-center gap-2 whitespace-nowrap">
              Read More <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border-theme">
            <h3 className="font-bold text-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              {[
                { label: 'All Updates', value: 'all', count: announcements.length },
                { label: 'High Priority', value: 'high', count: announcements.filter(a => a.priority === 'high').length },
                { label: 'General', value: 'medium', count: announcements.filter(a => a.priority === 'medium').length },
                { label: 'Information', value: 'low', count: announcements.filter(a => a.priority === 'low').length }
              ].map(cat => (
                <button 
                  key={cat.value}
                  onClick={() => setFilter(cat.value as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    filter === cat.value ? 'bg-primary-theme/10 text-primary-theme font-bold' : 'hover:bg-secondary-theme text-muted'
                  }`}
                >
                  <span className="text-sm">{cat.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    filter === cat.value ? 'bg-primary-theme/20' : 'bg-secondary-theme'
                  }`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-indigo-400" />
              Notifications
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed italic">"Stay informed about hospital policies and guidelines to provide excellent patient care."</p>
            <button className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold transition-all">Enable Push Notifications</button>
          </div>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <div key={announcement._id} className="bg-card rounded-2xl shadow-sm border border-border-theme overflow-hidden group hover:shadow-md transition-all hover:border-primary-theme/30">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getPriorityStyles(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted" />
                        <span className="text-xs font-bold text-muted">Admin</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mt-4 group-hover:text-primary-theme transition-colors">{announcement.title}</h3>
                    <p className="text-muted mt-2 text-sm leading-relaxed">{announcement.content}</p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                        <span className="ml-4 text-xs font-medium text-muted">+{Math.floor(Math.random() * 20)} others seen</span>
                      </div>
                      <button className="text-sm font-bold text-primary-theme hover:text-primary-theme/80 flex items-center gap-1.5">
                        View Details <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary-theme/50 rounded-3xl p-12 text-center border-2 border-dashed border-border-theme">
                <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-foreground font-bold">No announcements found</h3>
                <p className="text-muted text-sm mt-1">There are no updates at this time.</p>
                <button 
                  onClick={loadAnnouncements}
                  className="mt-6 px-6 py-2 bg-card border border-border-theme rounded-xl text-sm font-bold text-primary-theme hover:bg-secondary-theme transition-all"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
