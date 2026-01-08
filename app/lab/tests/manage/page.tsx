'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { DepartmentService } from '@/lib/integrations/services/department.service';
import { Department } from '@/lib/integrations/types/department';

export default function ManageTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get('id');
    const isEditMode = !!testId;

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        departmentId: '',
        sampleType: '',
        price: '',
        unit: '',
        method: '',
        turnaroundTime: '',
        normalRanges: {
            male: { min: '', max: '' },
            female: { min: '', max: '' },
            child: { min: '', max: '' },
        }
    });

    useEffect(() => {
        fetchDepartments();
        if (isEditMode) {
            fetchTestDetails();
        }
    }, [testId]);

    const fetchDepartments = async () => {
        try {
            const data = await DepartmentService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchTestDetails = async () => {
        if (!testId) return;
        setInitialLoading(true);
        try {
            const test = await LabTestService.getTestById(testId);
            setFormData({
                name: test.name,
                departmentId: typeof test.departmentId === 'object' ? test.departmentId._id : test.departmentId,
                sampleType: test.sampleType || '',
                price: test.price.toString(),
                unit: test.unit || '',
                method: test.method || '',
                turnaroundTime: test.turnaroundTime || '',
                normalRanges: test.normalRanges || {
                    male: { min: '', max: '' },
                    female: { min: '', max: '' },
                    child: { min: '', max: '' },
                }
            });
        } catch (error) {
            console.error("Failed to fetch test details", error);
            alert("Failed to load test details");
            router.push('/lab/tests');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            ...formData,
            price: parseFloat(formData.price),
        };

        try {
            if (isEditMode && testId) {
                await LabTestService.updateTest(testId, payload);
                alert("Test updated successfully!");
            } else {
                await LabTestService.addTest(payload);
                alert("Test added successfully!");
            }
            router.push('/lab/tests');
        } catch (error: any) {
            console.error("Save Error:", error);
            alert(error.message || "Failed to save test");
        } finally {
            setLoading(false);
        }
    };

    const handleRangeChange = (category: 'male' | 'female' | 'child', field: 'min' | 'max', value: string) => {
        setFormData(prev => ({
            ...prev,
            normalRanges: {
                ...prev.normalRanges,
                [category]: {
                    ...prev.normalRanges[category],
                    [field]: value
                }
            }
        }));
    };

    if (initialLoading) {
        return <div className="p-8 text-center text-gray-500">Loading test details...</div>;
    }

    return (
        <div className="p-6 min-h-full bg-gray-50 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Test' : 'Add New Test'}</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                    placeholder="e.g. Blood Sugar (Fasting)"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Department *</label>
                                <select
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                                    value={formData.departmentId}
                                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                >
                                    <option value="">-- Select Department --</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                    placeholder="e.g. Plasma, Serum"
                                    value={formData.sampleType}
                                    onChange={e => setFormData({ ...formData, sampleType: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                    placeholder="e.g. mg/dL"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                    placeholder="e.g. ELISA"
                                    value={formData.method}
                                    onChange={e => setFormData({ ...formData, method: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Turnaround Time</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                    placeholder="e.g. 24 Hours"
                                    value={formData.turnaroundTime}
                                    onChange={e => setFormData({ ...formData, turnaroundTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Normal Ranges Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Normal Ranges</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Male */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Male</label>
                                    <input
                                        type="text"
                                        placeholder="Min"
                                        className="w-full p-2 border border-gray-200 rounded text-sm mb-2"
                                        value={formData.normalRanges.male.min}
                                        onChange={e => handleRangeChange('male', 'min', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Max"
                                        className="w-full p-2 border border-gray-200 rounded text-sm"
                                        value={formData.normalRanges.male.max}
                                        onChange={e => handleRangeChange('male', 'max', e.target.value)}
                                    />
                                </div>
                                {/* Female */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Female</label>
                                    <input
                                        type="text"
                                        placeholder="Min"
                                        className="w-full p-2 border border-gray-200 rounded text-sm mb-2"
                                        value={formData.normalRanges.female.min}
                                        onChange={e => handleRangeChange('female', 'min', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Max"
                                        className="w-full p-2 border border-gray-200 rounded text-sm"
                                        value={formData.normalRanges.female.max}
                                        onChange={e => handleRangeChange('female', 'max', e.target.value)}
                                    />
                                </div>
                                {/* Child */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Child</label>
                                    <input
                                        type="text"
                                        placeholder="Min"
                                        className="w-full p-2 border border-gray-200 rounded text-sm mb-2"
                                        value={formData.normalRanges.child.min}
                                        onChange={e => handleRangeChange('child', 'min', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Max"
                                        className="w-full p-2 border border-gray-200 rounded text-sm"
                                        value={formData.normalRanges.child.max}
                                        onChange={e => handleRangeChange('child', 'max', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        Save Test
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
