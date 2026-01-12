'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Building2, Building, Trash, Edit3, X } from 'lucide-react';
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
        <div className="p-6 h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center transition-colors duration-500 w-full max-w-[100vw] overflow-x-hidden">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight uppercase">Department Master</h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Hospital Lab Infrastructure Management</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Add Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6 transition-colors">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 w-full"></div>
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                        {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                                    </div>
                                    <h2 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest">
                                        {editingId ? 'Update Department' : 'New Department'}
                                    </h2>
                                </div>

                                <form onSubmit={handleAddDepartment} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select or Enter Name *</label>
                                            {suggestedDepts.length > 0 && !editingId && (
                                                <select
                                                    className="w-full p-4 mb-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-sm transition-all dark:text-white"
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    value={formData.name}
                                                >
                                                    <option value="">-- Choose Common Dept --</option>
                                                    {suggestedDepts.map(name => (
                                                        <option key={name} value={name}>{name}</option>
                                                    ))}
                                                </select>
                                            )}
                                            <input
                                                type="text"
                                                placeholder="Or type custom name..."
                                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all text-sm dark:text-white"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                        <textarea
                                            placeholder="Details about tests handled here..."
                                            rows={4}
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all resize-none dark:text-white"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}
                                                className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : editingId ? 'Update Dept' : 'Create Dept'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right: List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col transition-colors">
                            {/* Search Header */}
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest">Global Hierarchy</h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{filteredDepartments.length} Departments Configured</p>
                                    </div>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 shadow-xl" size={16} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH DEPTS..."
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-bold text-[11px] tracking-widest dark:text-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* List Content */}
                            <div className="p-8 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredDepartments.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-300 dark:text-gray-600">
                                            <Building2 size={64} className="mb-4 opacity-20" />
                                            <p className="font-black uppercase tracking-[3px] text-[10px] mb-6">No Departments Found</p>
                                            {suggestedDepts.length > 0 && (
                                                <button
                                                    onClick={async () => {
                                                        setLoading(true);
                                                        try {
                                                            for (const name of suggestedDepts.slice(0, 5)) {
                                                                await DepartmentService.addDepartment({ name, description: `Standard ${name} department.` });
                                                            }
                                                            toast.success("Initialized with default departments!");
                                                            fetchInitialData();
                                                        } catch (e) {
                                                            toast.error("Failed to seed departments");
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all shadow-sm"
                                                >
                                                    Seed Default Departments
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        filteredDepartments.map((dept) => (
                                            <div
                                                key={dept._id}
                                                onClick={() => setSelectedDepartment(dept)}
                                                className="group p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden cursor-pointer"
                                            >
                                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingId(dept._id); setFormData({ name: dept.name, description: dept.description || '' }); }}
                                                        className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(dept._id); }}
                                                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {dept.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tight text-sm mb-1">{dept.name}</h3>
                                                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed line-clamp-2 mb-4">
                                                            {dept.description || 'No description provided for this department hierarchy.'}
                                                        </p>

                                                        {/* Tests summary */}
                                                        {dept.tests && dept.tests.length > 0 ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                                    <span>Active Tests</span>
                                                                    <span className="text-blue-600 dark:text-blue-400">{dept.testCount}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {dept.tests.slice(0, 3).map((test, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-md text-[9px] font-bold border border-gray-100 dark:border-gray-600">
                                                                            {test.testName}
                                                                        </span>
                                                                    ))}
                                                                    {(dept.testCount || 0) > 3 && (
                                                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-black">
                                                                            +{(dept.testCount || 0) - 3} More
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest italic">No tests assigned</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Details Modal */}
            {selectedDepartment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDepartment(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md lg:max-w-lg max-h-[80vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-3xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl">
                                    {selectedDepartment.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedDepartment.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{selectedDepartment.testCount || 0} Assigned Tests</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedDepartment(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body / Scrollable List */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {selectedDepartment.description && (
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                        {selectedDepartment.description}
                                    </p>
                                </div>
                            )}

                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                Test Configuration
                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
                            </h4>

                            {selectedDepartment.tests && selectedDepartment.tests.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedDepartment.tests.map((test: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">{test.testName}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Parameters Configured</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-black text-indigo-600 dark:text-indigo-400">₹{test.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                                    <p className="font-bold text-gray-400 dark:text-gray-500 mb-1">No Tests Assigned</p>
                                    <p className="text-xs text-gray-400">Go to Test Master to assign tests to this department.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 rounded-b-3xl">
                            <button
                                onClick={() => setSelectedDepartment(null)}
                                className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
