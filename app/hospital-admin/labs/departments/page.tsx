'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Building2, Building, Trash, Edit3, X, Network, Database, Layers } from 'lucide-react';
import { DepartmentService } from '@/lib/integrations/services/department.service';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { Department } from '@/lib/integrations/types/department';
import { toast } from 'react-hot-toast';

export default function HospitalAdminDepartmentMasterPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [suggestedDepts, setSuggestedDepts] = useState<string[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [deptData, meta] = await Promise.all([
                DepartmentService.getDepartments(),
                LabTestService.getMetaOptions()
            ]);
            setDepartments(deptData);
            if (meta && meta.departmentNames) {
                setSuggestedDepts(meta.departmentNames);
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            const data = await DepartmentService.getDepartments().catch(() => []);
            setDepartments(data);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await DepartmentService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const handleAddDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                await DepartmentService.updateDepartment(editingId, formData);
                toast.success("Department hierarchy updated");
            } else {
                await DepartmentService.addDepartment(formData);
                toast.success("New department node created");
            }
            setFormData({ name: '', description: '' });
            setEditingId(null);
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.message || "Protocol operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Warning: Purging this node will affect all associated test protocols. Proceed?")) return;
        try {
            await DepartmentService.deleteDepartment(id);
            toast.success("Department node purged");
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.message || "Node purge failed");
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Tier */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Department Master</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px] ml-1 flex items-center gap-2">
                        <Network className="w-3 h-3 text-blue-500" />
                        Strategic Lab Infrastructure & Node Hierarchy
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Input Console */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-gray-800 rounded-4xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                        <div className="bg-blue-600 h-2 w-full"></div>
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                                    {editingId ? <Edit3 size={24} /> : <Plus size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                        {editingId ? 'Modify Node' : 'Initialize Node'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Department registry Entry</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddDepartment} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomenclature Hub *</label>
                                    {suggestedDepts.length > 0 && !editingId && (
                                        <select
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black dark:text-white transition-all appearance-none"
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            value={formData.name}
                                        >
                                            <option value="">-- Choose Common Node --</option>
                                            {suggestedDepts.map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="CUSTOM_DEPT_ID..."
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black dark:text-white transition-all italic tracking-tight"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Functional Description</label>
                                    <textarea
                                        placeholder="OPERATIONAL_PROTOCOL_DETAILS..."
                                        rows={5}
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold dark:text-white transition-all resize-none tracking-tight leading-relaxed"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}
                                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[9px] active:scale-95 transition-all"
                                        >
                                            Abort
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : editingId ? 'Update Node' : 'Initialize Node'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right: Registry Terminal */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Search Control */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                                <Database size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Global Hierarchy</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{filteredDepartments.length} Departments Online</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="SEARCH_MANIFEST..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-[10px] font-black tracking-[0.2em] dark:text-white uppercase"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                        {filteredDepartments.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center p-20 opacity-30">
                                <Building2 size={80} className="mb-4" />
                                <p className="font-black uppercase tracking-[5px] text-xs">Node Database Empty</p>
                            </div>
                        ) : (
                            filteredDepartments.map((dept) => (
                                <div key={dept._id} className="group p-8 bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-500/20 rounded-[2.5rem] transition-all relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1">
                                    <div className="absolute top-4 right-4 flex gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={() => { setEditingId(dept._id); setFormData({ name: dept.name, description: dept.description || '' }); }}
                                            className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:scale-110 transition-transform"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept._id)}
                                            className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:scale-110 transition-transform"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl rotate-3 group-hover:rotate-0 transition-transform shadow-xl shadow-blue-200 dark:shadow-none">
                                            {dept.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg leading-tight mb-2 italic">{dept.name}</h3>
                                            <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-2 mb-6 tracking-tight">
                                                {dept.description || 'Global department hierarchy node without functional documentation.'}
                                            </p>

                                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-3 h-3 text-blue-500" />
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Protocols</span>
                                                    </div>
                                                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{(dept.testCount || 0).toString().padStart(2, '0')}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {dept.tests && dept.tests.length > 0 ? (
                                                        dept.tests.slice(0, 2).map((test, i) => (
                                                            <span key={i} className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-tighter">
                                                                {test.testName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[8px] font-black text-gray-300 uppercase italic">Zero protocols linked</span>
                                                    )}
                                                    {(dept.testCount || 0) > 2 && (
                                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-[8px] font-black">
                                                            +{(dept.testCount || 0) - 2} NODES
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
