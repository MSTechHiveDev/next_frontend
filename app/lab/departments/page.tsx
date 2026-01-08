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
        <div className="p-6 h-full bg-gray-50 flex flex-col items-center">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Department Master</h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Hospital Lab Infrastructure Management</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Add Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 w-full"></div>
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                        {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                                    </div>
                                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                        {editingId ? 'Update Department' : 'New Department'}
                                    </h2>
                                </div>

                                <form onSubmit={handleAddDepartment} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select or Enter Name *</label>
                                            {suggestedDepts.length > 0 && !editingId && (
                                                <select
                                                    className="w-full p-4 mb-2 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-sm transition-all"
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
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all text-sm"
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
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all resize-none"
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
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                            {/* Search Header */}
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Global Hierarchy</h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{filteredDepartments.length} Departments Configured</p>
                                    </div>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 shadow-xl" size={16} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH DEPTS..."
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-bold text-[11px] tracking-widest"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* List Content */}
                            <div className="p-8 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredDepartments.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-300">
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
                                                    className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Seed Default Departments
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        filteredDepartments.map((dept) => (
                                            <div key={dept._id} className="group p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                                    <button
                                                        onClick={() => { setEditingId(dept._id); setFormData({ name: dept.name, description: dept.description || '' }); }}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(dept._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {dept.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm mb-1">{dept.name}</h3>
                                                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed line-clamp-2 mb-4">
                                                            {dept.description || 'No description provided for this department hierarchy.'}
                                                        </p>

                                                        {/* Tests summary */}
                                                        {dept.tests && dept.tests.length > 0 ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                                    <span>Active Tests</span>
                                                                    <span className="text-blue-600">{dept.testCount}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {dept.tests.slice(0, 3).map((test, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[9px] font-bold border border-gray-100">
                                                                            {test.testName}
                                                                        </span>
                                                                    ))}
                                                                    {(dept.testCount || 0) > 3 && (
                                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black">
                                                                            +{(dept.testCount || 0) - 3} More
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">No tests assigned</p>
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
        </div>
    );
}
