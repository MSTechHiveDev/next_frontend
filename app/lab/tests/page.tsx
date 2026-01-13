'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Search, FlaskConical, LayoutGrid, ListFilter, Trash, Edit3 } from 'lucide-react';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { LabTest } from '@/lib/integrations/types/labTest';
import { toast } from 'react-hot-toast';

export default function TestListPage() {
    const router = useRouter();
    const [tests, setTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters & Pagination
    const [deptFilter, setDeptFilter] = useState('');
    const [sampleFilter, setSampleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Card view usually fits 8-10 better

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const data = await LabTestService.getTests();
            setTests(data);
        } catch (error) {
            console.error("Failed to fetch tests", error);
            toast.error("Failed to load test catalog");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this test?")) return;
        try {
            await LabTestService.deleteTest(id);
            toast.success("Test deactivated");
            fetchTests();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };

    // Derived Lists for Dropdowns
    const uniqueDepartments = Array.from(new Set(tests.map(t =>
        typeof t.departmentId === 'object' ? t.departmentId.name : 'General'
    ))).sort();

    const uniqueSamples = Array.from(new Set(tests.map(t =>
        t.sampleType || 'Unknown'
    ))).sort();

    // Filtering Logic
    const filteredTests = tests.filter(test => {
        const name = test.testName || test.name || '';
        const dept = typeof test.departmentId === 'object' ? test.departmentId.name : 'General';
        const sample = test.sampleType || 'Unknown';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter ? dept === deptFilter : true;
        const matchesSample = sampleFilter ? sample === sampleFilter : true;

        return matchesSearch && matchesDept && matchesSample;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
    const paginatedTests = filteredTests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none">
                            <FlaskConical className="w-8 h-8 text-white" />
                        </div>
                        Lab Test Catalog
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        Manage Available <span className="text-indigo-600 dark:text-indigo-400">Lab Tests</span>
                    </p>
                </div>
                
                <button
                    onClick={() => router.push('/lab/tests/manage')}
                    className="group relative flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-bold text-sm tracking-tight shadow-2xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                >
                    <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                        <Plus className="w-5 h-5" />
                    </div>
                    ADD NEW TEST
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Search Field */}
                    <div className="md:col-span-5 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH TESTS..."
                            className="w-full pl-14 pr-8 py-5 bg-gray-50/50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl outline-none transition-all font-bold text-gray-800 dark:text-white placeholder:text-gray-400 tracking-wide text-xs uppercase"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    {/* Department Filtering */}
                    <div className="md:col-span-3">
                        <div className="relative group">
                            <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 pointer-events-none" size={18} />
                            <select
                                className="w-full pl-12 pr-10 py-5 bg-gray-50/50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl outline-none transition-all font-bold text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-300 appearance-none cursor-pointer"
                                value={deptFilter}
                                onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                            >
                                 <option value="">ALL DEPARTMENTS</option>
                                {uniqueDepartments.map(d => <option key={d} value={d} className="dark:bg-gray-800">{d.toUpperCase()}</option>)}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ListFilter size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Modality Filtering */}
                    <div className="md:col-span-3">
                        <div className="relative group">
                            <FlaskConical className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 pointer-events-none" size={18} />
                            <select
                                className="w-full pl-12 pr-10 py-5 bg-gray-50/50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl outline-none transition-all font-bold text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-300 appearance-none cursor-pointer"
                                value={sampleFilter}
                                onChange={(e) => { setSampleFilter(e.target.value); setCurrentPage(1); }}
                            >
                                 <option value="">ALL SAMPLE TYPES</option>
                                {uniqueSamples.map(s => <option key={s} value={s} className="dark:bg-gray-800">{s.toUpperCase()}</option>)}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ListFilter size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Stat Cluster */}
                    <div className="md:col-span-1 flex lg:justify-end">
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 text-center min-w-[80px]">
                             <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Tests</span>
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{filteredTests.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test List */}
            <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden flex flex-col min-h-[600px] transition-all">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[1100px]">
                        <thead>
                             <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Test Name / Details</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Department</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Sample Type</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Methodology / TAT</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Price</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-14 h-14 border-[3px] border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin shadow-lg"></div>
                                            <div className="flex flex-col gap-1">
                                                 <p className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">Loading Tests...</p>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[2px]">Refreshing Test Catalog</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-full">
                                                <FlaskConical size={60} className="text-gray-300" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No Tests Found</p>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Adjust filters to find matching records</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTests.map((test) => (
                                    <tr key={test._id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group">
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl font-bold border border-gray-100 dark:border-gray-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                    {(test.testName || test.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-900 dark:text-white text-base tracking-tight uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {test.testName || test.name}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[2px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                                            Code: {test.testCode || 'NO-REF'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex flex-wrap gap-2">
                                                {(test.departments && test.departments.length > 0) ? (
                                                    test.departments.map((dept: any) => (
                                                        <span key={dept._id} className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-[12px] text-[9px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30 shadow-xs">
                                                            {dept.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-[12px] text-[9px] font-bold uppercase tracking-widest border border-slate-100 dark:border-slate-800 shadow-xs">
                                                        {typeof test.departmentId === 'object' ? (test.departmentId as any).name?.toUpperCase() : 'GENERAL'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="space-y-1">
                                                 <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{test.sampleType || 'GENERAL'}</p>
                                                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider italic">VOL: {test.sampleVolume || 'STANDARD'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="space-y-1.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                    {test.method || 'AUTOMATED'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-[2px]">
                                                    <span className="opacity-50 text-[8px]">TAT/</span> {test.turnaroundTime || '24-48 HRS'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex flex-col items-start px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 w-fit">
                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest opacity-60">PRICE</span>
                                                <p className="text-lg font-bold text-emerald-600 tracking-tight">₹{test.price.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                 <button
                                                    onClick={() => router.push(`/lab/tests/manage?id=${test._id}`)}
                                                    className="p-4 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-200 dark:hover:shadow-none active:scale-95"
                                                    title="Edit Test"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test._id)}
                                                    className="p-4 bg-white dark:bg-gray-700 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-100 dark:hover:shadow-none active:scale-95"
                                                    title="Deactivate Test"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            {/* Static version of actions for non-hover state */}
                                            <div className="flex justify-end gap-2 group-hover:hidden transition-all">
                                                <div className="w-10 h-1 bg-gray-100 dark:bg-gray-700 rounded-full" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-8 border-t border-gray-50 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-6 bg-gray-50/30 dark:bg-gray-900/10">
                         <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all shadow-sm active:scale-95"
                        >
                            PREVIOUS
                        </button>
                        
                        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px]">PAGE</span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {String(currentPage).padStart(2, '0')} <span className="mx-2 text-gray-300 font-light">/</span> {String(totalPages).padStart(2, '0')}
                            </span>
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 transition-all shadow-sm active:scale-95"
                        >
                            NEXT
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
}
