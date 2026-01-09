"use client";

import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Beaker, 
    Clock, 
    User, 
    Printer, 
    Search, 
    Filter, 
    Navigation, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    Loader2,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { helpdeskService } from '@/lib/integrations/services/helpdesk.service';
import DocumentPreviewModal from '@/components/common/DocumentPreviewModal';

export default function TransitsPage() {
  const [loading, setLoading] = useState(true);
  const [transits, setTransits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'prescription' | 'lab'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [profile, setProfile] = useState<any>(null);

  // Preview Modal State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchTransits();
    fetchProfile();
    
    // Auto-refresh fallback
    const interval = setInterval(fetchTransits, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
        const res = await helpdeskService.getMe();
        if (res) {
            setProfile(res);
            const hospitalId = res.hospital?._id || res.hospital;
            if (hospitalId) {
                setupSocket(typeof hospitalId === 'string' ? hospitalId : (hospitalId as any)._id);
            }
        }
    } catch (error) {
        console.error("Failed to fetch profile", error);
    }
  };

  const setupSocket = (hospitalId: string) => {
    if (!hospitalId) return;
    
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002', {
        withCredentials: true
    });

    socket.on('connect', () => {
        console.log('Connected to socket server');
        socket.emit('join_room', { 
            role: 'helpdesk', 
            userId: profile?._id, 
            hospitalId 
        });
    });

    socket.on('new_transit', (data) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-50`}>
              <div className="flex-1 w-0 p-5">
                <div className="flex items-start">
                  <div className="shrink-0 pt-0.5">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                        <Navigation size={24} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">New Transit Arrived</p>
                    <p className="mt-1 text-sm font-bold text-gray-500">{data.patientName}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">MRN: {data.patientMRN}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-100">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    fetchTransits();
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-3xl p-4 flex items-center justify-center text-sm font-black text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  Refresh
                </button>
              </div>
            </div>
        ), { duration: 5000 });
        fetchTransits();
    });

    return () => {
        socket.disconnect();
    };
  };

  const fetchTransits = async () => {
    try {
      const data = await helpdeskService.getTransits();
      setTransits(data.transits || []);
    } catch (error: any) {
      console.error('Failed to fetch transits:', error);
      toast.error(error.message || 'Failed to load transits');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (appointmentId: string) => {
      try {
          await helpdeskService.collectTransit(appointmentId);
          toast.success('Patient documents marked as collected');
          fetchTransits();
      } catch (error) {
          toast.error("Failed to mark collection");
      }
  };

  const filteredTransits = transits.filter(t => {
    if (filter === 'prescription' && !t.prescription) return false;
    if (filter === 'lab' && !t.labToken) return false;
    if (searchTerm && !t.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handlePrint = (transit: any, type: 'prescription' | 'lab') => {
    const url = type === 'prescription' ? transit.cloudinaryDocumentUrl : transit.cloudinaryLabTokenUrl;

    if (!url) {
        toast.error('Document URL not found. Please sync again.');
        return;
    }

    // Open document directly in new tab for printing
    toast.success('Opening document for printing...', { duration: 2000 });
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-xl text-white">
                        <Navigation size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Patient Transits</h1>
                 </div>
                 <p className="text-gray-500 font-medium">Manage and print clinical documents for completed consultations</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Patient Name or MRN..."
                        className="pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none w-full md:w-80 transition-all font-medium text-sm"
                    />
                </div>
            </div>
        </div>

        {/* Filters & Quick Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                {[
                    { value: 'all', label: 'All Document Transits', icon: Navigation },
                    { value: 'prescription', label: 'Prescriptions Only', icon: FileText },
                    { value: 'lab', label: 'Lab Tokens Only', icon: Beaker }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            filter === f.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <f.icon size={16} />
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-6 px-6 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-widest">{filteredTransits.length} Active Transits</span>
                </div>
            </div>
        </div>

        {/* Transits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Syncing Real-time Transits...</p>
                </div>
            ) : filteredTransits.length > 0 ? (
                filteredTransits.map((transit: any) => (
                    <div
                        key={transit._id}
                        className="group relative bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all border border-gray-100 dark:border-gray-700"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-8">
                             <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                                <CheckCircle2 size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Ready</span>
                             </div>
                        </div>

                        {/* Patient Profile */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-blue-100 overflow-hidden relative group-hover:rotate-3 transition-transform">
                                 <User size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{transit.patientName}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <span className="text-blue-600">ID: {transit.appointmentId}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(transit.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Document Stack */}
                        <div className="space-y-4 mb-8">
                            {transit.prescription && (
                                <div className="relative group/doc p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-blue-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                                            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                <FileText className="text-blue-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">Prescription</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{transit.prescription.medicines?.length || 0} Meds Prescribed</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handlePrint(transit, 'prescription')}
                                            className="p-3 bg-blue-600 shadow-md shadow-blue-200 text-white rounded-xl hover:bg-blue-700 transition-all"
                                        >
                                            <Printer size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {transit.labToken && (
                                <div className="relative group/doc p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-purple-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                                            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                <Beaker className="text-purple-600" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">Laboratory Token</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Token: {transit.labToken.tokenNumber}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handlePrint(transit, 'lab')}
                                            className="p-3 bg-purple-600 shadow-md shadow-purple-200 text-white rounded-xl hover:bg-purple-700 transition-all"
                                        >
                                            <Printer size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer & Collection */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultant</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Dr. {transit.doctorName}</span>
                             </div>
                             <button 
                                onClick={() => handleCollect(transit._id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                            >
                                Collect
                                <ChevronRight size={14} />
                             </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="text-gray-300" size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">System Idle</h3>
                    <p className="text-gray-500 font-medium italic max-w-sm">
                        Waiting for consultations to complete. New documents will appear here automatically via real-time sync.
                    </p>
                </div>
            )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes enter {
            0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes leave {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        .animate-enter { animation: enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-leave { animation: leave 0.3s forwards; }
      `}</style>
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        url={previewUrl} 
        title={previewTitle} 
      />
    </div>
  );
}
