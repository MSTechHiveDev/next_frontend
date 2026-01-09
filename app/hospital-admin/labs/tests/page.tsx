'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FlaskConical, LayoutGrid, Database, Activity, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { LabTest } from '@/lib/integrations/types/labTest';
import { toast } from 'react-hot-toast';

export default function HospitalAdminTestListPage() {
    const router = useRouter();
    const [tests, setTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
            toast.error("Failed to synchronize test catalog");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to purge this test protocol from the active registry?")) return;
        try {
            await LabTestService.deleteTest(id);
            toast.success("Protocol purged successfully");
            fetchTests();
        } catch (error: any) {
            toast.error(error.message || "Protocol purge failed");
        }
    };

    const filteredTests = tests.filter(test => {
        const name = test.testName || test.name || '';
        const dept = typeof test.departmentId === 'object' ? test.departmentId.name : '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Tier */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Test Master Catalog</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px] ml-1 flex items-center gap-2">
                        <Database className="w-3 h-3 text-blue-500" />
                        NABL Standard Node Registry & Diagnostic Parameters
                    </p>
                </div>
                <button
                    onClick={() => router.push('/hospital-admin/labs/tests/manage')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                    <Plus size={16} />
                    Initialize New Protocol
                </button>
            </div>

            {/* Strategic Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-2 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH_BY_NOMENCLATURE_OR_NODE..."
                        className="w-full pl-16 pr-8 py-5 bg-transparent border-none outline-none text-[10px] font-black tracking-[0.2em] dark:text-white uppercase placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registry Nodes</p>
                        <h3 className="text-3xl font-black text-blue-600 italic tracking-tighter">{(filteredTests.length).toString().padStart(2, '0')}</h3>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-3xl">
                        <LayoutGrid size={24} />
                    </div>
                </div>
            </div>

            {/* Registry Console Terminal */}
            <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocol Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Departmental node</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Bio-Material</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">TAT / Methodology</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Economic VAL</th>
                                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-10 py-8"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <FlaskConical size={80} className="text-gray-400" />
                                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.5em]">Protocol Manifest Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] flex items-center justify-center font-black text-xl text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    {(test.testName || test.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white text-base tracking-tighter italic uppercase">{test.testName || test.name}</p>
                                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">ID_REF: {test.testCode || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-wrap gap-2">
                                                {(test.departments && test.departments.length > 0) ? (
                                                    test.departments.slice(0, 2).map((dept: any) => (
                                                        <span key={dept._id} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-800/30">
                                                            {dept.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                        {typeof test.departmentId === 'object' ? (test.departmentId as any).name : 'MISC_NODE'}
                                                    </span>
                                                )}
                                                {(test.departments?.length || 0) > 2 && <span className="text-[9px] font-black text-blue-600">+{(test.departments?.length || 0) - 2} NODES</span>}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{test.sampleType || 'UNIT'}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">{test.sampleVolume || 'STANDARD_VOL'}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-3 h-3 text-blue-500" />
                                                <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{test.method || 'AUTOMATED'}</p>
                                            </div>
                                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-1 italic">TAT: {test.turnaroundTime || '24 CYCLES'}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl inline-block">
                                                <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter italic">₹{test.price.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => router.push(`/hospital-admin/labs/tests/manage?id=${test._id}`)}
                                                    className="p-3.5 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Modify Protocol"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test._id)}
                                                    className="p-3.5 bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                    title="Purge Protocol"
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
            </div>
        </div>
    );
}
