'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { LabSample } from '@/lib/integrations/types/labSample';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { FlaskConical, Filter, Download, Eye, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ResultPrintView from '@/components/lab/ResultPrintView';
import { toast } from 'react-hot-toast';

export default function SampleCollectionPage() {
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Samples');
    const [printingSample, setPrintingSample] = useState<LabSample | null>(null);

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
    }, [filter]);

    const fetchSamples = async () => {
        setLoading(true);
        try {
            const data = await LabSampleService.getSamples(filter);
            setSamples(data);
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
            fetchSamples();
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
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <FlaskConical className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Sample Collection
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Track and manage sample collection workflow</p>
                </div>

                <div className="relative">
                    <select
                        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 dark:text-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All Samples" className="dark:bg-gray-800">All Samples</option>
                        <option value="Pending" className="dark:bg-gray-800">Pending</option>
                        <option value="In Processing" className="dark:bg-gray-800">In Processing</option>
                        <option value="Completed" className="dark:bg-gray-800">Completed</option>
                    </select>
                    <Filter className="w-4 h-4 absolute right-3 top-3 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pending Collection</h3>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">{stats.pending}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">In Processing</h3>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.processing}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                    <h3 className="text-xs font-black text-green-400 uppercase tracking-widest mb-2">Completed Today</h3>
                    <div className="text-3xl font-black text-green-600 dark:text-green-400">{stats.completedToday}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                        <tr>
                            <th className="p-4 border-b dark:border-gray-700">Sample ID</th>
                            <th className="p-4 border-b dark:border-gray-700">Patient</th>
                            <th className="p-4 border-b dark:border-gray-700">Sample Type</th>
                            <th className="p-4 border-b dark:border-gray-700">Tests</th>
                            <th className="p-4 border-b dark:border-gray-700 text-center">Status</th>
                            <th className="p-4 border-b dark:border-gray-700 text-center">Time Taken</th>
                            <th className="p-4 border-b dark:border-gray-700 text-right px-8">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400">Loading samples...</td>
                            </tr>
                        ) : samples.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400">No samples found.</td>
                            </tr>
                        ) : (
                            samples.map((sample) => (
                                <tr key={sample._id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                                        {sample.sampleId}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{sample.patientDetails.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                            {sample.patientDetails.age}Y • {sample.patientDetails.gender}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-[10px] uppercase font-black border border-purple-100 dark:border-purple-800">
                                            {sample.sampleType || 'Not Specified'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">
                                        {sample.tests.map(t => t.testName).join(', ')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${sample.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            sample.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            }`}>
                                            {sample.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-xs text-gray-500 dark:text-gray-400">
                                        {(() => {
                                            if (sample.status === 'Pending' || !sample.collectionDate) return '-';
                                            const start = new Date(sample.collectionDate).getTime();
                                            const end = sample.status === 'Completed' && sample.reportDate
                                                ? new Date(sample.reportDate).getTime()
                                                : new Date().getTime();

                                            const diff = Math.max(0, end - start);
                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                                            if (hours > 0) return `${hours}h ${minutes}m`;
                                            return `${minutes}m`;
                                        })()}
                                    </td>
                                    <td className="p-4 text-right px-8">
                                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                            {sample.status === 'Pending' ? (
                                                <button
                                                    onClick={() => handleCollect(sample._id)}
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-none shadow-sm active:scale-95"
                                                >
                                                    Collect
                                                </button>
                                            ) : sample.status === 'In Processing' ? (
                                                <Link
                                                    href={`/lab/samples/${sample._id}`}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-none shadow-sm active:scale-95 whitespace-nowrap"
                                                >
                                                    Enter Sample Results
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/lab/samples/${sample._id}`}
                                                        className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                                        title="View Results"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDownload(sample)}
                                                        className="p-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40"
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

            {/* Hidden Print Area */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef}>
                    {printingSample && <ResultPrintView sample={printingSample} />}
                </div>
            </div>
        </div >
    );
}
