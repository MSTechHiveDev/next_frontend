'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LabSample } from '@/lib/integrations/types/labSample';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { FlaskConical, Activity, Clock } from 'lucide-react';
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
            router.push(`/lab/samples/${id}`);
        } catch (error) {
            toast.error('Failed to collect sample');
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Activity className="w-8 h-8 text-red-500" />
                        Active Lab Tests
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage pending sample collections and result entries</p>
                </div>
            </div>

            {/* Stats Summary for Active Page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-yellow-400 shadow-sm">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pending Collection</h3>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">
                        {samples.filter(s => s.status === 'Pending').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Awaiting Results</h3>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {samples.filter(s => s.status === 'In Processing').length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                        <tr>
                            <th className="p-4 border-b dark:border-gray-700">Priority</th>
                            <th className="p-4 border-b dark:border-gray-700">Sample ID</th>
                            <th className="p-4 border-b dark:border-gray-700">Patient Details</th>
                            <th className="p-4 border-b dark:border-gray-700">Test Required</th>
                            <th className="p-4 border-b dark:border-gray-700 text-center">Current Status</th>
                            <th className="p-4 border-b dark:border-gray-700 text-right px-8">Action Required</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading active tests...</td></tr>
                        ) : samples.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No active tests found.</td></tr>
                        ) : (
                            samples.map((sample) => (
                                <tr key={sample._id} className="border-b dark:border-gray-700 last:border-0 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded w-fit">
                                            <Clock size={14} />
                                            Active
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                                        {sample.sampleId}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{sample.patientDetails.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                            {sample.patientDetails.age}Y • {sample.patientDetails.gender}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">
                                        {sample.tests.map(t => t.testName).join(', ')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${sample.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            }`}>
                                            {sample.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right px-8">
                                        {sample.status === 'Pending' ? (
                                            <button
                                                onClick={() => handleCollect(sample._id)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/30 active:scale-95 animate-pulse"
                                            >
                                                <FlaskConical size={16} />
                                                Collect Sample
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/lab/samples/${sample._id}`}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                                            >
                                                <Activity size={16} />
                                                Enter Results
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
