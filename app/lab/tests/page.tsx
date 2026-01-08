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

    const filteredTests = tests.filter(test => {
        const name = test.testName || test.name || '';
        const dept = typeof test.departmentId === 'object' ? test.departmentId.name : '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="p-6 h-full bg-gray-50 flex flex-col items-center">
            <div className="max-w-6xl w-full flex-1 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Test Master Catalog</h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">NABL & Hospital Grade Lab Catalog</p>
                    </div>
                    <button
                        onClick={() => router.push('/lab/tests/manage')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                    >
                        <Plus size={16} />
                        Add New Test
                    </button>
                </div>

                {/* Search & Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="md:col-span-3 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH BY TEST NAME OR DEPARTMENT..."
                            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-extrabold text-[12px] tracking-widest shadow-xl shadow-gray-200/40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Tests</p>
                            <h3 className="text-2xl font-black text-blue-600">{filteredTests.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <LayoutGrid size={24} />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-50 flex-1 overflow-hidden flex flex-col mb-8">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Test Detail</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Department</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Sample</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">TAT / Method</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Price</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Test Matrix...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <FlaskConical size={64} className="text-gray-400" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching tests found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTests.map((test) => (
                                        <tr key={test._id} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {(test.testName || test.name || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-gray-800 text-sm tracking-tight">{test.testName || test.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Code: {test.testCode || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {(test.departments && test.departments.length > 0) ? (
                                                        test.departments.map((dept: any) => (
                                                            <span key={dept._id} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                                                                {dept.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                            {typeof test.departmentId === 'object' ? (test.departmentId as any).name : 'MISC'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{test.sampleType || 'N/A'}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{test.sampleVolume || 'Standard volume'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] font-black text-gray-600 uppercase tracking-wider">{test.method || 'Auto'}</p>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{test.turnaroundTime || '24 hrs'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-gray-900 tracking-tight">₹{test.price.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => router.push(`/lab/tests/manage?id=${test._id}`)}
                                                        className="p-3 bg-white text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(test._id)}
                                                        className="p-3 bg-white text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Trash size={16} />
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
        </div>
    );
}
