'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Database, FlaskConical, Network, Calculator, Activity, ChevronLeft } from 'lucide-react';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { DepartmentService } from '@/lib/integrations/services/department.service';
import { Department } from '@/lib/integrations/types/department';
import { toast } from 'react-hot-toast';

export default function HospitalAdminManageTestPage() {
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
            toast.error("Resource synchronization failed");
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
            toast.error("Protocol retrieval failed");
            router.push('/hospital-admin/labs/tests');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const priceVal = parseFloat(formData.price);
        if (isNaN(priceVal) || priceVal < 0) {
            toast.error("Economic value must be non-negative");
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
                toast.success("Protocol hierarchy updated");
            } else {
                await LabTestService.addTest(payload);
                toast.success("New protocol node initialized");
            }
            router.push('/hospital-admin/labs/tests');
        } catch (error: any) {
            toast.error(error.message || "Protocol save failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRangeChange = (category: 'male' | 'female' | 'child', field: 'min' | 'max', value: string) => {
        setFormData(prev => ({
            ...prev,
            normalRanges: { ...prev.normalRanges, [category]: { ...prev.normalRanges[category], [field]: value } }
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
            toast.success("Department node active");
        } catch (error) {
            toast.error("Node initialization failed");
        }
    };

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Protocol Metadata...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Tier */}
            <div className="flex items-center gap-6">
                <button onClick={() => router.back()} className="p-4 bg-white dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm active:scale-95 group">
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">{isEditMode ? 'Modify Protocol' : 'Initialize Protocol'}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-[0.2em] text-[10px] ml-1 flex items-center gap-2">
                        <Database className="w-3 h-3 text-blue-500" />
                        Strategic Lab Catalog Node Management
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-blue-600 h-2 w-full"></div>
                <form onSubmit={handleSubmit} className="p-10 lg:p-16 space-y-16">

                    {/* Primary Identifier Section */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                                <FlaskConical size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic underline decoration-blue-500/30 decoration-4 underline-offset-8">Primary Identifiers</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Nomenclature *</label>
                                <div className="flex gap-3">
                                    <select
                                        required
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black dark:text-white transition-all appearance-none"
                                        value={formData.testName}
                                        onChange={e => setFormData({ ...formData, testName: e.target.value })}
                                    >
                                        <option value="">-- Select Hub Template --</option>
                                        {metaOptions.testNames.map((name: string) => <option key={name} value={name}>{name}</option>)}
                                        {formData.testName && !metaOptions.testNames.includes(formData.testName) && <option value={formData.testName}>{formData.testName}</option>}
                                    </select>
                                    <button type="button" onClick={() => setShowTestModal(true)} className="p-4 bg-blue-600 text-white rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95"><Plus size={24} /></button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Economic Valuation (₹) *</label>
                                <div className="relative">
                                    <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-black italic tracking-tighter text-blue-600"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Node Distribution *</label>
                                    <button type="button" onClick={() => setShowDeptModal(true)} className="px-5 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">Initialize Node</button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {departments.map(dept => {
                                        const isSelected = formData.departmentIds.includes(dept._id);
                                        return (
                                            <div
                                                key={dept._id}
                                                onClick={() => {
                                                    const newIds = isSelected ? formData.departmentIds.filter(id => id !== dept._id) : [...formData.departmentIds, dept._id];
                                                    setFormData({ ...formData, departmentIds: newIds, departmentId: newIds[0] || '' });
                                                }}
                                                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'border-gray-50 dark:border-gray-700/50 bg-gray-50/50 text-gray-400 hover:border-blue-200'}`}
                                            >
                                                <Network size={20} className={isSelected ? 'text-blue-600' : 'text-gray-300'} />
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-center">{dept.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Metadata Section */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic underline decoration-purple-500/30 decoration-4 underline-offset-8">Operational Metadata</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio-material Type *</label>
                                <div className="flex gap-2">
                                    <select
                                        required
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-xs font-black dark:text-white"
                                        value={formData.sampleType}
                                        onChange={e => setFormData({ ...formData, sampleType: e.target.value })}
                                    >
                                        <option value="">-- Select Material --</option>
                                        {metaOptions.sampleTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowSampleModal(true)} className="p-4 bg-purple-600 text-white rounded-2xl active:scale-95"><Plus size={20} /></button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Processing Methodology</label>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-xs font-black dark:text-white"
                                        value={formData.method}
                                        onChange={e => setFormData({ ...formData, method: e.target.value })}
                                    >
                                        <option value="">-- Select Method --</option>
                                        {metaOptions.methods.map((m: string) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowMethodModal(true)} className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-2xl active:scale-95"><Plus size={20} /></button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal TAT cycle</label>
                                <select
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-xs font-black dark:text-white"
                                    value={formData.turnaroundTime}
                                    onChange={e => setFormData({ ...formData, turnaroundTime: e.target.value })}
                                >
                                    <option value="">-- Select Interval --</option>
                                    {metaOptions.turnaroundTimes.map((tat: string) => <option key={tat} value={tat}>{tat}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Terminal */}
                    <div className="flex justify-end items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={() => router.back()} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-rose-500 transition-colors">Abort sequence</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Synchronize protocol</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODALS */}
            {(showTestModal || showDeptModal || showMethodModal || showSampleModal) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] italic">
                                Initialize {showTestModal ? 'Protocol' : showDeptModal ? 'Node' : showSampleModal ? 'Material' : 'Method'}
                            </h3>
                            <button onClick={() => { setShowTestModal(false); setShowDeptModal(false); setShowMethodModal(false); setShowSampleModal(false); setNewItemName(''); }} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 rounded-xl transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Nomenclature Hub</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full p-5 bg-gray-50 dark:bg-gray-900 border-none rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black dark:text-white italic tracking-tight"
                                    placeholder="NOMENCLATURE_VAL..."
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (showTestModal) { setFormData(prev => ({ ...prev, testName: newItemName })); setShowTestModal(false); }
                                    else if (showDeptModal) { handleAddNewDept(); }
                                    else if (showSampleModal) { setFormData(prev => ({ ...prev, sampleType: newItemName })); setShowSampleModal(false); }
                                    else { setFormData(prev => ({ ...prev, method: newItemName })); setShowMethodModal(false); }
                                    setNewItemName('');
                                }}
                                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Synchronize node
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
