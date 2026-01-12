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
    Activity,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { helpdeskService } from '@/lib/integrations/services/helpdesk.service';
import DocumentPreviewModal from '@/components/common/DocumentPreviewModal';
import Link from 'next/link';

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

  const fetchTransits = async () => {
    try {
      const data = await helpdeskService.getTransits();
      setTransits(data.transits || []);
    } catch (error: any) {
      console.error('Failed to fetch transits:', error);
    } finally {
      if (loading) setLoading(false);
    }
  };

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
    } catch (error) {}
  };

  useEffect(() => {
    fetchTransits();
    fetchProfile();
    const interval = setInterval(fetchTransits, 60000);
    return () => clearInterval(interval);
  }, []);

  const setupSocket = (hospitalId: string) => {
    if (!hospitalId) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002', { withCredentials: true });

    socket.on('connect', () => {
        socket.emit('join_room', { role: 'helpdesk', userId: profile?._id, hospitalId });
    });

    socket.on('new_transit', (data) => {
        toast.success(`NEW TRANSIT: ${data.patientName}`);
        fetchTransits();
    });

    return () => { socket.disconnect(); };
  };

  const handleCollect = async (appointmentId: string) => {
      try {
          await helpdeskService.collectTransit(appointmentId);
          toast.success('Collection Verified');
          fetchTransits();
      } catch (error) {
          toast.error("Collection error");
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
    if (!url) { toast.error('URL missing'); return; }
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Transits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* PROFESSIONAL HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                <ArrowLeft size={16} />
            </Link>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Logistics / Transits</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Clinical Document Transits
          </h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Hospital Node / Distribution Center</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Reference / Patient Index..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight outline-none shadow-sm focus:border-teal-500 transition-all"
                />
            </div>
            <button onClick={fetchTransits} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm" aria-label="Refresh Transits">
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
            {/* FILTER BAR */}
            {/* FILTER BAR / SEGMENTED SWITCH */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-100 rounded-xl shadow-sm max-w-fit">
                {[
                    { value: 'all', label: 'All Transits', icon: Navigation },
                    { value: 'prescription', label: 'Prescriptions', icon: FileText },
                    { value: 'lab', label: 'Lab Tokens', icon: Beaker }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value as any)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                            filter === f.value
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <f.icon size={12} />
                        {f.label}
                    </button>
                ))}
            </div>

            {/* TRANSIT MANIFEST GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTransits.length > 0 ? filteredTransits.map((transit: any) => (
                    <div key={transit._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all group flex flex-col gap-6">
                        
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl uppercase transition-transform shadow-sm">
                                    {transit.patientName?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{transit.patientName}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">REF: {transit.appointmentId?.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase tracking-widest rounded-md border border-emerald-100">
                                Ready
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            {transit.prescription && (
                                <DocumentCard 
                                    label="Prescription" 
                                    icon={<FileText className="text-teal-600" size={14} />} 
                                    onPrint={() => handlePrint(transit, 'prescription')}
                                />
                            )}
                            {transit.labToken && (
                                <DocumentCard 
                                    label="Lab Token" 
                                    icon={<Beaker className="text-rose-600" size={14} />} 
                                    onPrint={() => handlePrint(transit, 'lab')}
                                />
                            )}
                        </div>

                        <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                             <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authorized By</p>
                                <p className="text-[10px] font-bold text-slate-700 uppercase">Dr. {transit.doctorName}</p>
                             </div>
                             <button 
                                onClick={() => handleCollect(transit._id)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 shadow-lg shadow-teal-900/20 flex items-center gap-2"
                             >
                                Collect Documents <ChevronRight size={14} />
                             </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No clinical transits pending distribution</p>
                    </div>
                )}
            </div>
      </div>
      
      <DocumentPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        url={previewUrl} 
        title={previewTitle} 
      />
    </div>
  );
}

function DocumentCard({ label, icon, onPrint }: any) {
    return (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group/doc hover:bg-white hover:border-teal-200 transition-all">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{label}</span>
            </div>
            <button 
                onClick={onPrint}
                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-teal-600 hover:border-teal-100 transition-all"
                aria-label={`Print ${label}`}
            >
                <Printer size={14} />
            </button>
        </div>
    );
}
