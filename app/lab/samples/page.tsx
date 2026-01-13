'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { LabSample } from '@/lib/integrations/types/labSample';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { FlaskConical, Filter, Download, Eye, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ResultPrintView from '@/components/lab/ResultPrintView';
import { toast } from 'react-hot-toast';

export default function SampleCollectionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(searchParams.get('filter') || 'All Samples');
    const [printingSample, setPrintingSample] = useState<LabSample | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSamples, setTotalSamples] = useState(0);

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        onAfterPrint: () => setPrintingSample(null),
    });

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (printingSample && printRef.current) {
            // Give the browser a moment to render the hidden component and load the print iframe
            timer = setTimeout(() => {
                handlePrint();
            }, 150);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [printingSample, handlePrint]);

    useEffect(() => {
        fetchSamples();

        // Real-time updates
        const handleNewOrder = (data: any) => {
            console.log("🔔 New Lab Order Received:", data);

            // Check if this new order belongs to this hospital (if filtering logic needed, though backend room handles it)
            // Ideally backend only emits to this hospital's room so we assume it's relevant.

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
                // Avoid duplicates
                if (prev.find(s => s._id === data._id)) return prev;
                return [data, ...prev];
            });
        };

        import('@/lib/integrations/api/socket').then(({ subscribeToSocket, unsubscribeFromSocket }) => {
            subscribeToSocket('hospital_channel', 'new_lab_order', handleNewOrder);

            // Cleanup
            return () => {
                unsubscribeFromSocket('hospital_channel', 'new_lab_order', handleNewOrder);
            };
        });

    }, [filter]);

    useEffect(() => {
        fetchSamples(currentPage);
    }, [currentPage]);

    const fetchSamples = async (page = 1) => {
        setLoading(true);
        try {
            const data = await LabSampleService.getSamplesPaginated(page, 10, filter);
            setSamples(data.samples);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalSamples(data.totalSamples);
        } catch (error) {
            console.error(error);
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
                    sampleId: sample._id, // Database ID
                    displayId: sample.sampleId, // Short ID
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

    const handleDownload = async (sample: LabSample) => {
        setPrintingSample(sample);
        // Mark as completed if it's currently In Processing
        if (sample.status === 'In Processing') {
            try {
                await LabSampleService.updateResults(sample._id, { status: 'Completed' });
                fetchSamples();
            } catch (error) {
                console.error("Failed to mark as completed", error);
            }
        }
    };

    const getStats = () => {
        const today = new Date().toISOString().split('T')[0];
        return {
            pending: samples.filter(s => s.status === 'Pending').length,
            processing: samples.filter(s => s.status === 'In Processing').length,
            completedToday: samples.filter(s =>
                s.status === 'Completed' && s.reportDate && s.reportDate.startsWith(today)
            ).length,
        };
    };

    const stats = getStats();

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <FlaskConical className="w-5 h-5 text-white" />
                        </div>
                        Lab Samples
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        Manage Lab <span className="text-indigo-600 dark:text-indigo-400">Samples & Tracking</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <select
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All Samples">All Samples</option>
                            <option value="Pending">Pending</option>
                            <option value="In Processing">In Processing</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <Filter className="w-4 h-4 absolute right-4 top-3 text-indigo-400 pointer-events-none group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Collection', value: stats.pending, icon: FlaskConical, color: 'indigo' },
                    { label: 'In Processing', value: stats.processing, icon: Eye, color: 'blue' },
                    { label: 'Completed Today', value: stats.completedToday, icon: FileText, color: 'emerald' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className={`p-5 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-950/20 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[2px] mb-1">{item.label}</p>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</h4>
                            </div>
                        </div>
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-${item.color}-50 dark:bg-${item.color}-900/10 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                    </div>
                ))}
            </div>

            {/* Registry Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sample ID / Order ID</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Details</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sample Type</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested Tests</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">TAT (Turnaround Time)</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Samples...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : samples.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20 grayscale">
                                            <FlaskConical className="w-12 h-12 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Samples Found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                samples.map((sample) => (
                                    <tr key={sample._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg w-fit mb-1 border border-indigo-100 dark:border-indigo-800">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs tracking-tight">{sample.sampleId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{sample.patientDetails.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">{sample.patientDetails.age}Y • {sample.patientDetails.gender}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-50 dark:bg-gray-700/50 text-slate-600 dark:text-gray-300 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-100 dark:border-gray-600">
                                                {sample.sampleType || 'GENT'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {sample.tests.slice(0, 2).map((t, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                                        {t.testName}{i < Math.min(sample.tests.length, 2) - 1 ? ',' : ''}
                                                    </span>
                                                ))}
                                                {sample.tests.length > 2 && (
                                                    <span className="text-[10px] text-indigo-400 font-bold">+{sample.tests.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                                sample.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                                                sample.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                                                'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                                            }`}>
                                                {sample.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {(() => {
                                                if (sample.status === 'Pending' || !sample.collectionDate) return (<span className="text-gray-200">--</span>);
                                                const start = new Date(sample.collectionDate).getTime();
                                                const end = sample.status === 'Completed' && sample.reportDate
                                                    ? new Date(sample.reportDate).getTime()
                                                    : new Date().getTime();

                                                const diff = Math.max(0, end - start);
                                                const hours = Math.floor(diff / (1000 * 60 * 60));
                                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ELAPSED</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 items-center">
                                                 {sample.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleCollect(sample._id)}
                                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 dark:shadow-none translate-y-0 active:scale-95"
                                                    >
                                                        Collect Sample
                                                    </button>
                                                ) : sample.status === 'In Processing' ? (
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
                                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-100 dark:shadow-none translate-y-0 active:scale-95 whitespace-nowrap"
                                                    >
                                                        Go to Billing
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={`/lab/samples/${sample._id}`}
                                                            className="p-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                            title="View Results"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(sample); }}
                                                            className="p-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                                            title="Download Report"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && samples.length > 0 && (
                    <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page <span className="text-indigo-600">{currentPage}</span> / {totalPages}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-all disabled:opacity-30 shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-all disabled:opacity-30 shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden Print Area */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef}>
                    {printingSample && <ResultPrintView sample={printingSample as LabSample} />}
                </div>
            </div>
        </div>
    );
}
