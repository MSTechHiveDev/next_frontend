'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LabSample } from '@/lib/integrations/types/labSample';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { FlaskConical, Activity, Clock, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ActiveTestsPage() {
    const router = useRouter();
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [loading, setLoading] = useState(true);

    // Refresh data whenever we navigate to this page
    useEffect(() => {
        console.log('🔄 Active Tests Page: Initial mount - fetching data');
        fetchActiveSamples();

        // Real-time updates
        const handleNewOrder = (data: any) => {
            console.log("🔔 New Lab Order Received:", data);
            toast.success('New Active Test Request!', {
                icon: '🔔',
                duration: 5000,
                style: {
                    background: '#ecfccb',
                    color: '#365314',
                    fontWeight: 'bold',
                },
            });

            // Optimistically update list
            setSamples(prev => {
                if (prev.find(s => s._id === data._id)) return prev;
                return [data, ...prev];
            });
        };

        // Auto-refresh when page becomes visible (e.g., after returning from billing)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ Page became visible - refreshing active tests');
                fetchActiveSamples();
            }
        };

        // Also refresh when window gains focus (more reliable for navigation)
        const handleFocus = () => {
            console.log('🎯 Window focused - refreshing active tests');
            fetchActiveSamples();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        import('@/lib/integrations/api/socket').then(({ subscribeToSocket, unsubscribeFromSocket }) => {
            subscribeToSocket('hospital_channel', 'new_lab_order', handleNewOrder);
            return () => {
                unsubscribeFromSocket('hospital_channel', 'new_lab_order', handleNewOrder);
            };
        });

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchActiveSamples = async () => {
        console.log('📊 Fetching active samples...');
        setLoading(true);
        try {
            const pending = await LabSampleService.getSamples('Pending');
            const processing = await LabSampleService.getSamples('In Processing');

            console.log(`✅ Fetched ${pending.length} Pending samples:`, pending.map(s => ({ id: s.sampleId, status: s.status })));
            console.log(`✅ Fetched ${processing.length} In Processing samples:`, processing.map(s => ({ id: s.sampleId, status: s.status })));

            // Combine and filter out any completed items (safety net), then sort by date (newest first)
            const combined = [...pending, ...processing]
                .filter(s => {
                    const status = s.status?.toLowerCase();
                    return status !== 'completed';
                })
                .sort((a, b) => {
                    const dateA = new Date(a.collectionDate || a.createdAt || '').getTime();
                    const dateB = new Date(b.collectionDate || b.createdAt || '').getTime();
                    return dateB - dateA;
                });

            console.log(`📋 Total active samples after combining and filtering: ${combined.length}`);
            setSamples(combined);
        } catch (error) {
            console.error('❌ Error fetching active samples:', error);
            toast.error("Failed to load active tests");
        } finally {
            setLoading(false);
        }
    };

    const handleCollect = async (id: string) => {
        try {
            await LabSampleService.collectSample(id);
            toast.success('Sample collected successfully');
            
            // Navigate to billing with patient and test details
            const sample = samples.find(s => s._id === id);
            if (sample) {
                const query = new URLSearchParams({
                    name: sample.patientDetails.name,
                    mobile: sample.patientDetails.mobile,
                    age: sample.patientDetails.age.toString(),
                    gender: sample.patientDetails.gender,
                    sampleId: sample._id, // Use database ID for API
                    displayId: sample.sampleId, // Use short ID for display
                    tests: sample.tests.map(t => t.testName).join(',')
                }).toString();
                router.push(`/lab/billing?${query}`);
            } else {
                router.push('/lab/billing');
            }
        } catch (error) {
            toast.error('Failed to collect sample');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lab test request?')) return;
        try {
            await LabSampleService.deleteSample(id);
            toast.success('Lab test request deleted');
            fetchActiveSamples();
        } catch (error) {
            toast.error('Failed to delete lab test request');
        }
    };


    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-12 px-6 lg:px-0">
            {/* Dynamic Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-rose-600 rounded-2xl shadow-xl shadow-rose-200 dark:shadow-none font-bold">
                            <Activity className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        Active Lab Tests
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                        Live <span className="text-rose-600 dark:text-rose-400">Samples</span> & Status Tracking
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchActiveSamples}
                        disabled={loading}
                        className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95 group"
                    >
                        <Clock className={`w-5 h-5 text-indigo-500 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Operational Pulse Cluster (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/30 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">Pending Collection</h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter">
                                {loading ? '...' : samples.filter(s => s.status === 'Pending').length}
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <FlaskConical size={32} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        Immediate Action Required
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/30 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">In Processing</h3>
                            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                {loading ? '...' : samples.filter(s => s.status === 'In Processing').length}
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Activity size={32} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        Synchronized Analysis
                    </p>
                </div>
            </div>

            {/* Workflow Matrix (Table) */}
            <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/40 dark:shadow-none overflow-hidden transition-all">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                 <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-100 dark:border-gray-800">Status</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-100 dark:border-gray-800">Sample ID</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-100 dark:border-gray-800">Patient Details</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-100 dark:border-gray-800">Requested Tests</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-100 dark:border-gray-800 text-center">Current Phase</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-100 dark:border-gray-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="p-8"><div className="h-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl w-full" /></td>
                                    </tr>
                                ))
                            ) : samples.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Activity size={64} className="text-gray-300 mb-6" />
                                            <p className="font-bold text-gray-400 uppercase tracking-[4px] text-xs">No Active Tests Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                samples.map((sample) => (
                                    <tr key={sample._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-300">
                                        <td className="p-8">
                                             <div className="flex items-center gap-3 w-fit px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100/50 dark:border-rose-900/10 transition-transform group-hover:scale-105 duration-300">
                                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="font-black text-gray-900 dark:text-white tracking-widest text-sm uppercase">
                                                {sample.sampleId}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-gray-900 dark:text-white text-base truncate max-w-[200px] group-hover:text-indigo-600 transition-colors">
                                                    {sample.patientDetails.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                                                    {sample.patientDetails.age}Y • {sample.patientDetails.gender} • REF-{sample.patientDetails.refDoctor.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-wrap gap-2">
                                                {sample.tests.map((t, idx) => (
                                                    <div key={idx} className="shrink-0 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200/50 dark:border-gray-700">
                                                        {t.testName}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${sample.status === 'Pending' 
                                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' 
                                                : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                }`}>
                                                 <Activity size={12} className={sample.status !== 'Pending' ? 'animate-pulse' : ''} />
                                                {sample.status === 'Pending' ? 'PENDING' : 'PROCESSING'}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right">
                                            {sample.status === 'Pending' ? (
                                                 <button
                                                    onClick={() => handleCollect(sample._id)}
                                                    className="inline-flex items-center gap-3 px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all shadow-xl shadow-amber-200 dark:shadow-none active:scale-95 group/btn"
                                                >
                                                    <FlaskConical size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                    Collect Sample
                                                </button>
                                            ) : (
                                                 <Link
                                                    href={`/lab/billing?${new URLSearchParams({
                                                        name: sample.patientDetails.name,
                                                        mobile: sample.patientDetails.mobile,
                                                        age: sample.patientDetails.age.toString(),
                                                        gender: sample.patientDetails.gender,
                                                        sampleId: sample._id, // Database ID
                                                        displayId: sample.sampleId, // Short ID
                                                        tests: sample.tests.map(t => t.testName).join(',')
                                                    }).toString()}`}
                                                    className="inline-flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 group/btn"
                                                >
                                                    <Activity size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    Go to Billing
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => handleDelete(sample._id)}
                                                className="ml-3 inline-flex items-center justify-center p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 group/del"
                                                title="Delete Request"
                                            >
                                                <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}</style>
        </div>
    );
}
