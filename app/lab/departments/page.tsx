'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Building2, Building } from 'lucide-react';
import { DepartmentService } from '@/lib/integrations/services/department.service';
import { Department } from '@/lib/integrations/types/department';

export default function DepartmentMasterPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

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
            await DepartmentService.addDepartment(formData);
            setFormData({ name: '', description: '' });
            fetchDepartments(); // Refresh list
        } catch (error: any) {
            alert(error.message || "Failed to add department");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
        try {
            await DepartmentService.deleteDepartment(id);
            fetchDepartments();
        } catch (error: any) {
            alert(error.message || "Failed to delete department");
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Department Master</h1>
                <p className="text-gray-500 text-sm mt-1">Manage laboratory departments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left: Add Form */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-lg">
                            <Plus size={20} />
                            <span className="font-semibold">Add New Department</span>
                        </div>

                        <form onSubmit={handleAddDepartment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Haematology"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Optional description for this department"
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Adding...' : (
                                    <>
                                        <Plus size={18} />
                                        Add Department
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: List */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <Building size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">Existing Departments</h2>
                                <p className="text-xs text-gray-500">{filteredDepartments.length} departments found</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-purple-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {filteredDepartments.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No departments found
                                </div>
                            ) : (
                                filteredDepartments.map((dept, index) => (
                                    <div key={dept._id} className="group p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all bg-white flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="mt-1 bg-blue-50 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                                                {dept.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(dept._id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Department"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
