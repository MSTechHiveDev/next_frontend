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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FlaskConical className="w-8 h-8 text-indigo-600" />
                        Sample Collection
                    </h1>
                    <p className="text-gray-500">Track and manage sample collection workflow</p>
                </div>

                <div className="relative">
                    <select
                        className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option>All Samples</option>
                        <option>Pending</option>
                        <option>In Processing</option>
                        <option>Completed</option>
                    </select>
                    <Filter className="w-4 h-4 absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pending Collection</h3>
                    <div className="text-3xl font-black text-gray-800">{stats.pending}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">In Processing</h3>
                    <div className="text-3xl font-black text-blue-600">{stats.processing}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-green-400 uppercase tracking-widest mb-2">Completed Today</h3>
                    <div className="text-3xl font-black text-green-600">{stats.completedToday}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                        <tr>
                            <th className="p-4 border-b">Sample ID</th>
                            <th className="p-4 border-b">Patient</th>
                            <th className="p-4 border-b">Sample Type</th>
                            <th className="p-4 border-b">Tests</th>
                            <th className="p-4 border-b text-center">Status</th>
                            <th className="p-4 border-b text-right px-8">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">Loading samples...</td>
                            </tr>
                        ) : samples.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">No samples found.</td>
                            </tr>
                        ) : (
                            samples.map((sample) => (
                                <tr key={sample._id} className="border-b last:border-0 transition-colors">
                                    <td className="p-4 font-bold text-indigo-600">
                                        {sample.sampleId}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{sample.patientDetails.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                            {sample.patientDetails.age}Y • {sample.patientDetails.gender}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] uppercase font-black border border-purple-100">
                                            {sample.sampleType || 'Not Specified'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">
                                        {sample.tests.map(t => t.testName).join(', ')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${sample.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            sample.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {sample.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right px-8">
                                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                            {sample.status === 'Pending' ? (
                                                <button
                                                    onClick={() => handleCollect(sample._id)}
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-none shadow-sm active:scale-95"
                                                >
                                                    Collect
                                                </button>
                                            ) : sample.status === 'In Processing' ? (
                                                <Link
                                                    href={`/lab/samples/${sample._id}`}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-none shadow-sm active:scale-95 whitespace-nowrap"
                                                >
                                                    Enter Sample Results
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/lab/samples/${sample._id}`}
                                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"
                                                        title="View Results"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDownload(sample)}
                                                        className="p-2 text-green-600 bg-green-50 rounded-lg"
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
        </div>
    );
}
