'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { DepartmentService } from '@/lib/integrations/services/department.service';
import { Department } from '@/lib/integrations/types/department';
import { toast } from 'react-hot-toast';

export default function ManageTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get('id');
    const isEditMode = !!testId;

    const [departments, setDepartments] = useState<Department[]>([]);
    const [metaOptions, setMetaOptions] = useState<any>({
        testNames: [],
        methods: [],
        sampleTypes: [],
        turnaroundTimes: [],
        units: []
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    // Modal States
    const [showTestModal, setShowTestModal] = useState(false);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    const [formData, setFormData] = useState({
        testName: '',
        departmentId: '',
        departmentIds: [] as string[],
        sampleType: '',
        price: '',
        unit: '',
        method: '',
        turnaroundTime: '',
        normalRanges: {
            male: { min: '', max: '' },
            female: { min: '', max: '' },
            child: { min: '', max: '' },
        },
        fastingRequired: false,
        sampleVolume: '',
        testCode: '',
        reportType: 'numeric' as 'numeric' | 'text' | 'both',
    });

    useEffect(() => {
        fetchInitialData();
        if (isEditMode) {
            fetchTestDetails();
        }
    }, [testId]);

    const fetchInitialData = async () => {
        try {
            const [depts, meta] = await Promise.all([
                DepartmentService.getDepartments(),
                LabTestService.getMetaOptions()
            ]);
            setDepartments(depts);
            setMetaOptions(meta);

            if (!isEditMode && depts.length > 0) {
                setFormData(prev => ({ ...prev, departmentId: depts[0]._id, departmentIds: [depts[0]._id] }));
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchTestDetails = async () => {
        if (!testId) return;
        setInitialLoading(true);
        try {
            const test = await LabTestService.getTestById(testId);
            setFormData({
                testName: test.testName || (test as any).name,
                departmentId: typeof test.departmentId === 'object' ? test.departmentId._id : test.departmentId || '',
                departmentIds: test.departmentIds?.map((d: any) => typeof d === 'object' ? d._id : d) ||
                    (test.departmentId ? [typeof test.departmentId === 'object' ? test.departmentId._id : test.departmentId] : []),
                sampleType: test.sampleType || '',
                price: test.price.toString(),
                unit: test.unit || '',
                method: test.method || '',
                turnaroundTime: test.turnaroundTime || '',
                normalRanges: {
                    male: { min: test.normalRanges?.male.min.toString() || '', max: test.normalRanges?.male.max.toString() || '' },
                    female: { min: test.normalRanges?.female.min.toString() || '', max: test.normalRanges?.female.max.toString() || '' },
                    child: { min: test.normalRanges?.child.min.toString() || '', max: test.normalRanges?.child.max.toString() || '' },
                },
                fastingRequired: test.fastingRequired || false,
                sampleVolume: test.sampleVolume || '',
                reportType: test.reportType || 'numeric',
                testCode: test.testCode || '',
            });
        } catch (error) {
            console.error("Failed to fetch test details", error);
            toast.error("Failed to load test details");
            router.push('/lab/tests');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Price Validation
        const priceVal = parseFloat(formData.price);
        if (isNaN(priceVal) || priceVal < 0) {
            toast.error("Please enter a valid non-negative price");
            return;
        }

        setLoading(true);

        const payload: any = {
            ...formData,
            price: priceVal,
            normalRanges: {
                male: { min: parseFloat(formData.normalRanges.male.min) || 0, max: parseFloat(formData.normalRanges.male.max) || 0 },
                female: { min: parseFloat(formData.normalRanges.female.min) || 0, max: parseFloat(formData.normalRanges.female.max) || 0 },
                child: { min: parseFloat(formData.normalRanges.child.min) || 0, max: parseFloat(formData.normalRanges.child.max) || 0 },
            }
        };

        try {
            if (isEditMode && testId) {
                await LabTestService.updateTest(testId, payload);
                toast.success("Test updated successfully!");
            } else {
                await LabTestService.addTest(payload);
                toast.success("Test added successfully!");
            }
            router.push('/lab/tests');
        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(error.message || "Failed to save test");
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

    const handleAddNewDept = async () => {
        if (!newItemName) return;
        try {
            const res = await DepartmentService.addDepartment({ name: newItemName });
            setDepartments(prev => [...prev, res.department]);
            setFormData(prev => ({
                ...prev,
                departmentId: res.department._id,
                departmentIds: Array.from(new Set([...prev.departmentIds, res.department._id]))
            }));
            setShowDeptModal(false);
            setNewItemName('');
            toast.success("Department added!");
        } catch (error) {
            toast.error("Failed to add department");
        }
    };

    if (initialLoading) {
        return <div className="p-8 text-center text-gray-500">Loading test details...</div>;
    }

    return (
        <div className="p-6 min-h-full bg-gray-50 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">{isEditMode ? 'EDIT TEST MASTER' : 'CREATE TEST MASTER'}</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2 w-full"></div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* 1. REQUIRED FIELDS SECTION */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[2px] border-l-4 border-blue-600 pl-3">Required Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Test Name */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Test Name *</label>
                                    <div className="flex gap-2">
                                        <select
                                            required
                                            className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-semibold transition-all"
                                            value={formData.testName}
                                            onChange={e => setFormData({ ...formData, testName: e.target.value })}
                                        >
                                            <option value="">-- Select Test Name --</option>
                                            {metaOptions.testNames.map((name: string) => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                            {formData.testName && !metaOptions.testNames.includes(formData.testName) && (
                                                <option value={formData.testName}>{formData.testName}</option>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowTestModal(true)}
                                            className="p-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Departments */}
                                <div className="space-y-4 col-span-full">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Associated Departments *</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeptModal(true)}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={14} />
                                            Add New Dept
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {departments.map(dept => {
                                            const isSelected = formData.departmentIds.includes(dept._id);
                                            return (
                                                <div
                                                    key={dept._id}
                                                    onClick={() => {
                                                        const newIds = isSelected
                                                            ? formData.departmentIds.filter(id => id !== dept._id)
                                                            : [...formData.departmentIds, dept._id];
                                                        setFormData({ ...formData, departmentIds: newIds, departmentId: newIds[0] || '' });
                                                    }}
                                                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${isSelected
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                            : 'bg-gray-50/50 border-gray-100 text-gray-500 hover:border-blue-200'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-300'}`}></div>
                                                    <span className="text-[11px] font-black uppercase tracking-tight truncate">{dept.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {formData.departmentIds.length === 0 && (
                                        <p className="text-[10px] text-red-500 font-bold uppercase">Please select at least one department</p>
                                    )}
                                </div>

                                {/* Sample Type */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Sample Type *</label>
                                    <div className="flex gap-2">
                                        <select
                                            required
                                            className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-semibold transition-all"
                                            value={formData.sampleType}
                                            onChange={e => setFormData({ ...formData, sampleType: e.target.value })}
                                        >
                                            <option value="">-- Select Sample --</option>
                                            {metaOptions.sampleTypes.map((type: string) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                            {formData.sampleType && !metaOptions.sampleTypes.includes(formData.sampleType) && (
                                                <option value={formData.sampleType}>{formData.sampleType}</option>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowSampleModal(true)}
                                            className="p-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') e.preventDefault();
                                        }}
                                        className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-semibold transition-all placeholder:text-gray-300"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>

                                {/* Test Code */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Test Code (Internal)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-semibold transition-all placeholder:text-gray-300"
                                        placeholder="e.g. CBC-001"
                                        value={formData.testCode}
                                        onChange={e => setFormData({ ...formData, testCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. CLINICAL DETAILS SECTION */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px] border-l-4 border-indigo-600 pl-3">Clinical & Medical Reporting</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Unit</label>
                                    <select
                                        className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50/50 text-sm font-semibold"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="">-- Select Unit --</option>
                                        {metaOptions.units?.map((u: string) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Method</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50/50 text-sm font-semibold"
                                            value={formData.method}
                                            onChange={e => setFormData({ ...formData, method: e.target.value })}
                                        >
                                            <option value="">-- Select Method --</option>
                                            {metaOptions.methods.map((m: string) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                            {formData.method && !metaOptions.methods.includes(formData.method) && (
                                                <option value={formData.method}>{formData.method}</option>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowMethodModal(true)}
                                            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Turnaround Time</label>
                                    <select
                                        className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50/50 text-sm font-semibold"
                                        value={formData.turnaroundTime}
                                        onChange={e => setFormData({ ...formData, turnaroundTime: e.target.value })}
                                    >
                                        <option value="">-- Select TAT --</option>
                                        {metaOptions.turnaroundTimes.map((tat: string) => (
                                            <option key={tat} value={tat}>{tat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-50">
                                    <input
                                        type="checkbox"
                                        id="fasting"
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={formData.fastingRequired}
                                        onChange={e => setFormData({ ...formData, fastingRequired: e.target.checked })}
                                    />
                                    <label htmlFor="fasting" className="text-sm font-bold text-gray-700">Fasting Required</label>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Report Type</label>
                                    <select
                                        className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50/50 text-sm font-semibold"
                                        value={formData.reportType}
                                        onChange={e => setFormData({ ...formData, reportType: e.target.value as any })}
                                    >
                                        <option value="numeric">Numeric Only</option>
                                        <option value="text">Textual / Remarks</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider">Sample Volume</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:border-indigo-500 bg-gray-50/50 text-sm font-semibold"
                                        placeholder="e.g. 2ml Serum"
                                        value={formData.sampleVolume}
                                        onChange={e => setFormData({ ...formData, sampleVolume: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. NORMAL RANGES SECTION */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-[2px] border-l-4 border-purple-600 pl-3">Normal Reference Ranges</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Male */}
                                <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-50 space-y-4">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <label className="text-xs font-black uppercase tracking-widest">Male Range</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.normalRanges.male.min}
                                            onChange={e => handleRangeChange('male', 'min', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            className="w-full p-3 bg-white border border-blue-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                                            value={formData.normalRanges.male.max}
                                            onChange={e => handleRangeChange('male', 'max', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Female */}
                                <div className="p-5 bg-pink-50/30 rounded-2xl border border-pink-50 space-y-4">
                                    <div className="flex items-center gap-2 text-pink-700">
                                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                        <label className="text-xs font-black uppercase tracking-widest">Female Range</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            className="w-full p-3 bg-white border border-pink-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500/20"
                                            value={formData.normalRanges.female.min}
                                            onChange={e => handleRangeChange('female', 'min', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            className="w-full p-3 bg-white border border-pink-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500/20"
                                            value={formData.normalRanges.female.max}
                                            onChange={e => handleRangeChange('female', 'max', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Child */}
                                <div className="p-5 bg-green-50/30 rounded-2xl border border-green-50 space-y-4">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <label className="text-xs font-black uppercase tracking-widest">Child Range</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            className="w-full p-3 bg-white border border-green-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                                            value={formData.normalRanges.child.min}
                                            onChange={e => handleRangeChange('child', 'min', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                            className="w-full p-3 bg-white border border-green-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                                            value={formData.normalRanges.child.max}
                                            onChange={e => handleRangeChange('child', 'max', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT SECTION */}
                        <div className="flex justify-end items-center gap-4 pt-8 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest text-[11px] hover:text-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/30 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Saving Changes...' : (
                                    <>
                                        <Save size={18} />
                                        Save Test Master
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODALS */}
            {(showTestModal || showDeptModal || showMethodModal || showSampleModal) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                Add New {showTestModal ? 'Test Name' : showDeptModal ? 'Department' : showSampleModal ? 'Sample Type' : 'Method'}
                            </h3>
                            <button onClick={() => { setShowTestModal(false); setShowDeptModal(false); setShowMethodModal(false); setShowSampleModal(false); setNewItemName(''); }} className="text-gray-400 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select or Enter Name</label>
                                {showDeptModal && metaOptions.departmentNames && (
                                    <select
                                        className="w-full p-4 mb-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        value={newItemName}
                                    >
                                        <option value="">-- Choose From Common Depts --</option>
                                        {metaOptions.departmentNames.map((name: string) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                )}
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                                    placeholder="Or type custom name..."
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (showTestModal) {
                                        setFormData(prev => ({ ...prev, testName: newItemName }));
                                        setShowTestModal(false);
                                    } else if (showDeptModal) {
                                        handleAddNewDept();
                                    } else if (showSampleModal) {
                                        setFormData(prev => ({ ...prev, sampleType: newItemName }));
                                        setShowSampleModal(false);
                                    } else {
                                        setFormData(prev => ({ ...prev, method: newItemName }));
                                        setShowMethodModal(false);
                                    }
                                    setNewItemName('');
                                }}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Save & Select
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
