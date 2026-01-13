'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Building2, Building, Trash, Edit3, X, FlaskConical } from 'lucide-react';
import { DepartmentService } from '@/lib/integrations/services/department.service';
import { Department } from '@/lib/integrations/types/department';
import { toast } from 'react-hot-toast';

export default function DepartmentMasterPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [suggestedDepts, setSuggestedDepts] = useState<string[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [deptData, meta] = await Promise.all([
                DepartmentService.getDepartments(),
                // We'll fetch meta to get suggested department names
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/lab/meta`).then(res => res.json())
            ]);
            setDepartments(deptData);
            if (meta && meta.departmentNames) {
                setSuggestedDepts(meta.departmentNames);
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            // Fallback for departments if meta fails
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
                toast.success("Department updated successfully!");
            } else {
                await DepartmentService.addDepartment(formData);
                toast.success("Department created successfully!");
            }
            setFormData({ name: '', description: '' });
            setEditingId(null);
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this department? Active tests in this department might be affected.")) return;
        try {
            await DepartmentService.deleteDepartment(id);
            toast.success("Department deleted successfully");
            fetchDepartments();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete department");
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-12 px-6 lg:px-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none font-bold">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        Departments Management
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        Manage Laboratory <span className="text-indigo-600 dark:text-indigo-400">Departments</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Department Form */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden sticky top-32 transition-all">
                        <div className="h-2 bg-indigo-600 w-full opacity-60"></div>
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                    {editingId ? <Edit3 size={22} /> : <Plus size={22} />}
                                </div>
                                <div>
                                     <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
                                        {editingId ? 'Edit Department' : 'Add Department'}
                                    </h2>
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Configure Department Details</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddDepartment} className="space-y-8">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Department Name *</label>
                                    {suggestedDepts.length > 0 && !editingId && (
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-xs transition-all dark:text-white appearance-none cursor-pointer tracking-wide"
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            value={formData.name}
                                        >
                                            <option value="">SELECT TEMPLATE...</option>
                                            {suggestedDepts.map(name => (
                                                <option key={name} value={name} className="dark:bg-gray-900">{name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    )}
                                     <input
                                        type="text"
                                        placeholder="ENTER DEPARTMENT NAME..."
                                        className="w-full px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl outline-none transition-all font-bold text-xs dark:text-white placeholder:text-gray-400 tracking-wide uppercase"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Description</label>
                                    <textarea
                                        placeholder="ENTER DEPARTMENT DESCRIPTION..."
                                        rows={5}
                                        className="w-full px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl outline-none transition-all font-bold text-xs dark:text-white placeholder:text-gray-400 tracking-wide resize-none uppercase"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}
                                            className="flex-1 py-5 bg-gray-50 dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-700 rounded-2xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            CANCEL
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-2 py-5 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 dark:shadow-none active:scale-95 transition-all disabled:opacity-50 hover:bg-indigo-700"
                                    >
                                         {loading ? 'SYNCING...' : editingId ? 'UPDATE DEPARTMENT' : 'ADD DEPARTMENT'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Departments List */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden min-h-[700px] flex flex-col transition-all">
                        {/* Search Control Cluster */}
                        <div className="p-10 border-b border-gray-50 dark:border-gray-700/50 bg-gray-50/20 dark:bg-gray-900/10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                                    <Building2 size={24} />
                                </div>
                                 <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">Registered Departments</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                        Departments Count: <span className="text-indigo-600 dark:text-indigo-400 ml-1">{filteredDepartments.length} UNITS</span>
                                    </p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                 <input
                                    type="text"
                                    placeholder="SEARCH DEPARTMENTS..."
                                    className="w-full pl-14 pr-8 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-xs uppercase tracking-widest dark:text-white placeholder:text-gray-400 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Department List */}
                        <div className="p-10 flex-1">
                            {filteredDepartments.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
                                    <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-full mb-8 opacity-40">
                                        <Building size={80} className="text-gray-300" />
                                    </div>
                                     <p className="font-bold uppercase tracking-[4px] text-sm text-gray-400 mb-8">No Departments Found</p>
                                    {suggestedDepts.length > 0 && (
                                        <button
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    for (const name of suggestedDepts.slice(0, 5)) {
                                                        await DepartmentService.addDepartment({ name, description: `Operational Unit designated for standard ${name} processing.` });
                                                    }
                                                    toast.success("Default Infrastructure Deployed!");
                                                    fetchInitialData();
                                                } catch (e) {
                                                    toast.error("Deployment Failed");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-none active:scale-95"
                                        >
                                             SEED DEPARTMENTS
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {filteredDepartments.map((dept) => (
                                        <div
                                            key={dept._id}
                                            onClick={() => setSelectedDepartment(dept)}
                                            className="group p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[32px] hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden cursor-pointer"
                                        >
                                            {/* Action Control Overlays */}
                                            <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex gap-2">
                                                 <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingId(dept._id); setFormData({ name: dept.name, description: dept.description || '' }); }}
                                                    className="p-3 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Edit Department"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                 <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(dept._id); }}
                                                    className="p-3 bg-white dark:bg-gray-700 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete Department"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-start gap-6">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-2xl border border-gray-100/50 dark:border-gray-800 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                                    {dept.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-lg truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {dept.name}
                                                        </h3>
                                                    </div>
                                                     <p className="text-xs text-gray-400 font-semibold leading-relaxed line-clamp-2 mb-6 uppercase tracking-wider">
                                                        {dept.description || 'No description provided for this department.'}
                                                    </p>

                                                     {/* Department Summary */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                         <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100/50 dark:border-gray-800">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tests Count</p>
                                                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{dept.testCount || 0}</p>
                                                        </div>
                                                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/10">
                                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">STATUS</p>
                                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                                OPERATIONAL
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Details Modal */}
            {selectedDepartment && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md transition-all duration-300" onClick={() => setSelectedDepartment(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-[40px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-3xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-8 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                         {/* Modal Header */}
                        <div className="p-10 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/50 rounded-t-[40px]">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center text-3xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none">
                                    {selectedDepartment.name.charAt(0).toUpperCase()}
                                </div>
                                  <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{selectedDepartment.name}</h3>
                                     <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[4px]">{selectedDepartment.testCount || 0} TESTS</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedDepartment(null)}
                                className="p-3 bg-white dark:bg-gray-700 text-gray-400 hover:text-rose-500 border border-gray-100 dark:border-gray-800 rounded-2xl transition-all shadow-sm active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                         {/* Modal Body */}
                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                            {selectedDepartment.description && (
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] ml-1">Department Description</h4>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border border-slate-100/50 dark:border-slate-800/50">
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-wide">
                                            {selectedDepartment.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                   <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Tests in Department</h4>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[2px] bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">ACTIVE</span>
                                </div>

                                {selectedDepartment.tests && selectedDepartment.tests.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedDepartment.tests.map((test: any, index: number) => (
                                            <div
                                                key={index}
                                                className="group flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[22px] shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:translate-x-1"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100/50 dark:border-gray-700 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-tight">{test.testName}</div>
                                                         <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[2px] mt-0.5">Test Ready</div>
                                                    </div>
                                                </div>
                                                <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/10">
                                                    <span className="text-sm font-bold text-emerald-600 tracking-tight">₹{test.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px] opacity-50">
                                         <FlaskConical size={48} className="text-gray-300 mb-4" />
                                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No tests found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Modal Footer */}
                        <div className="p-10 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/50 rounded-b-[40px]">
                                 <button
                                onClick={() => setSelectedDepartment(null)}
                                className="w-full py-5 bg-gray-900 dark:bg-gray-700 text-white rounded-[24px] font-bold uppercase tracking-widest text-[11px] hover:bg-black dark:hover:bg-gray-600 transition-all shadow-2xl shadow-gray-200 dark:shadow-none active:scale-95"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
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
