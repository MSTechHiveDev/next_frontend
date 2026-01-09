'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    FileEdit,
    Printer,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    Filter,
    Trash2,
} from 'lucide-react';
import { Card, Button } from '@/components/admin';
import { dischargeService } from '@/lib/integrations/services/discharge.service';
import { PrintableDischargeSummary } from '../components/PrintableDischargeSummary';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

export default function DischargeHistoryPage() {
    const router = useRouter();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    // Printing state
    const [printData, setPrintData] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handleDirectPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Discharge_Summary_${printData?.mrn || 'Record'}`,
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 3 || searchTerm.length === 0) {
                setDebouncedSearch(searchTerm);
                setPage(1); // Reset to first page on new search
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await dischargeService.getHistory(page, limit, debouncedSearch);
            setRecords(response.data || []);
            if (response.pagination) {
                setPagination({
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages
                });
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Subsequent fetches on page or search changes (skip initial to avoid double call)
    useEffect(() => {
        if (page > 1 || debouncedSearch !== '') {
            fetchHistory();
        }
    }, [page, debouncedSearch]);

    const handleEdit = (id: string) => {
        router.push(`/discharge?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this record")) {
            return;
        }

        try {
            await dischargeService.deleteRecord(id);
            toast.success("Record deleted successfully", {
                icon: '🗑️',
                duration: 4000
            });
            // Refresh records
            fetchHistory();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete record");
        }
    };

    const triggerPrint = (record: any) => {
        setPrintData(record);
        // Wait for state update to trigger print
        setTimeout(() => {
            handleDirectPrint();
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            Discharge History
                        </h1>
                        <p className="text-sm font-medium text-gray-500">
                            Track and manage all committed patient summaries
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search Name, MRN, IP No..."
                                className="pl-11 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] border-none shadow-xl shadow-blue-200">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Records</p>
                                <h3 className="text-4xl font-black">{pagination.total}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <FileEdit size={24} />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Current Page</p>
                                <h3 className="text-lg font-black text-gray-900">
                                    {page} of {pagination.totalPages}
                                </h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                                <Filter size={24} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Search Results</p>
                                <h3 className="text-lg font-black text-gray-900">
                                    {debouncedSearch ? `"${debouncedSearch}"` : 'All Records'}
                                </h3>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Records Table */}
                <Card className="rounded-[2.5rem] border-white shadow-2xl shadow-blue-900/5 overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">ID Identifiers</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Clinical Team</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status / Date</th>
                                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-6">
                                                <div className="h-8 bg-gray-100 rounded-xl w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                    <Search size={40} />
                                                </div>
                                                <h3 className="text-lg font-black text-gray-900">No records found</h3>
                                                <p className="text-sm text-gray-500 font-medium">Try adjusting your search or add a new discharge summary.</p>
                                                <Button onClick={() => router.push('/discharge')} className="bg-blue-600 text-white rounded-xl">
                                                    Create New Summary
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
                                                        {record.patientName?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{record.patientName}</h4>
                                                        <p className="text-xs font-semibold text-gray-400">{record.gender} • {record.age}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-wider">MRN: {record.mrn}</span>
                                                    
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="space-y-1">
                                                   
                                                    <p className="text-xs text-gray-400 line-clamp-1 italic">
                                                        {record.consultants?.join(', ') || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${record.conditionAtDischarge === 'Improved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <span className="text-xs font-bold text-gray-700">{record.conditionAtDischarge}</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(record._id)}
                                                        className="p-3 bg-white border border-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all"
                                                        title="Edit Summary"
                                                    >
                                                        <FileEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerPrint(record)}
                                                        className="p-3 bg-white border border-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white rounded-xl shadow-sm transition-all"
                                                        title="Print Directly"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(record._id)}
                                                        className="p-3 bg-white border border-gray-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {pagination.totalPages > 1 && (
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="font-bold text-gray-900">{records.length}</span> of <span className="font-bold text-gray-900">{pagination.total}</span> records
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Hidden Printable Component */}
            <div className="hidden">
                <PrintableDischargeSummary
                    ref={printRef}
                    data={printData}
                    consultants={printData?.consultants || []}
                />
            </div>
        </div>
    );
}
