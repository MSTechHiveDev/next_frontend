'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { TestParameter } from '@/lib/integrations/types/labTest';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { LabSample, SampleTestResult } from '@/lib/integrations/types/labSample';
import { useReactToPrint } from 'react-to-print';
import ResultPrintView from '@/components/lab/ResultPrintView';
import { toast } from 'react-hot-toast';
import { Activity, ChevronRight, Trash2, Download, Bookmark, Clock } from 'lucide-react';

export default function LabResultEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [sample, setSample] = useState<LabSample | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSample();
        }
    }, [id]);
    const [processing, setProcessing] = useState(false);
    const [selectedDept, setSelectedDept] = useState('All');
    const isCompleted = sample?.status === 'Completed';

    // Temp state for editing
    const [testResults, setTestResults] = useState<SampleTestResult[]>([]);

    // Helper to get range string from parameters based on patient details
    const getRangeStringFromParams = (param: TestParameter | any, patient: any) => {
        const { age, gender } = patient;
        let range;

        // Use generic interface structure for main test (similar logic)
        const ranges = param.normalRanges as any;
        if (!ranges) return param.normalRange || '';

        if (age === 0) {
            range = ranges?.newborn || ranges?.infant;
        } else if (age < 1) {
            range = ranges?.infant;
        } else if (age < 12) {
            range = ranges?.child;
        } else if (age > 60) {
            range = ranges?.geriatric;
        } else if (gender.toLowerCase() === 'male') {
            range = ranges?.male;
        } else {
            range = ranges?.female;
        }

        // Fallback to simpler logic or generic if specific range missing but others exist
        if (!range) {
            if (gender.toLowerCase() === 'male') range = ranges?.male;
            else range = ranges?.female;
        }

        if (range) {
            if (range.text) return range.text;
            if (range.min !== undefined || range.max !== undefined) return `${range.min} - ${range.max}`;
        }
        return '';
    };

    const fetchSample = async () => {
        setLoading(true);
        try {
            const data = await LabSampleService.getSampleById(id);
            setSample(data);

            // Initialize form with existing tests or fetch parameters
            // Note: Backend now auto-populates subTests for new orders too!
            const initializedTests = data.tests.map((testItem) => {
                const updatedSubTests = (testItem.subTests || []).map(st => ({
                    ...st,
                    // If range string is empty (freshly fetched from backend), calculate it
                    range: st.range || getRangeStringFromParams(st, data.patientDetails)
                }));

                return {
                    ...testItem,
                    subTests: updatedSubTests
                };
            });

            setTestResults(initializedTests);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load sample details');
        } finally {
            setLoading(false);
        }
    };

    const handleResultChange = (index: number, field: keyof SampleTestResult, value: any) => {
        const updated = [...testResults];
        updated[index] = { ...updated[index], [field]: value };
        setTestResults(updated);
    };

    const handleAddSubTest = (testIndex: number) => {
        const updated = [...testResults];
        const currentTest = updated[testIndex];
        if (!currentTest.subTests) currentTest.subTests = [];

        currentTest.subTests.push({
            name: '',
            result: '',
            unit: '',
            range: ''
        });

        setTestResults(updated);
    };

    const handleSubTestChange = (testIndex: number, subIndex: number, field: keyof any, value: string) => {
        const updated = [...testResults];
        const currentTest = updated[testIndex];
        if (currentTest.subTests) {
            currentTest.subTests[subIndex] = { ...currentTest.subTests[subIndex], [field]: value };
        }
        setTestResults(updated);
    };

    const removeSubTest = (testIndex: number, subIndex: number) => {
        const updated = [...testResults];
        const currentTest = updated[testIndex];
        if (currentTest.subTests) {
            currentTest.subTests.splice(subIndex, 1);
        }
        setTestResults(updated);
    };

    const handleSubmit = async () => {
        if (!sample) return;

        // Validation: Every test must have a resultValue
        const missingResults = testResults.filter(t => !t.resultValue || t.resultValue.trim() === '');
        if (missingResults.length > 0) {
            toast.error(`Please enter Result Value for all tests (${missingResults.length} pending)`);
            return;
        }

        setProcessing(true);
        try {
            // Keep as Processing so Billing Close can finalize it
            const newStatus = 'In Processing';

            // Filter out empty subtests before sending
            const cleanedTests = testResults.map(test => ({
                ...test,
                subTests: test.subTests?.filter(st => st.name.trim() !== '') || []
            }));

            // If starting processing (first time), set collection date if missing
            const collectionDate = sample.collectionDate || new Date().toISOString();

            await LabSampleService.updateResults(sample._id, {
                tests: cleanedTests,
                status: newStatus,
                collectionDate,
                reportDate: new Date().toISOString() // Set report date upon completion
            });

            toast.success('Report submitted successfully!');

            // Redirect to billing with details
            const params = new URLSearchParams();
            params.set('name', sample.patientDetails.name || '');
            params.set('mobile', sample.patientDetails.mobile || ''); // Assuming mobile might exist on details
            params.set('age', sample.patientDetails.age?.toString() || '0');
            params.set('gender', sample.patientDetails.gender || '');

            // Collect unique test names from the sample
            const testNames = Array.from(new Set(testResults.map(t => t.testName)));
            params.set('tests', testNames.join(','));
            params.set('sampleId', sample._id); // Pass sampleId for closing the loop

            router.push(`/lab/billing?${params.toString()}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit results');
        } finally {
            setProcessing(false);
        }
    };

    /* ----------------------------------------
       Print Logic
    ---------------------------------------- */
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: sample ? `Report_${sample.sampleId}` : 'LabReport',
    });

    const getDisplayRange = (test: SampleTestResult) => {
        // This is for the main test display (top level)
        if (!sample || !test.normalRanges) return test.normalRange || 'N/A';
        const { age, gender } = sample.patientDetails;

        let range;
        // Use generic interface structure for main test (similar logic)
        const ranges = test.normalRanges as any;
        if (age === 0) {
            range = ranges?.newborn || ranges?.infant;
        } else if (age < 1) {
            range = ranges?.infant;
        } else if (age < 12) {
            range = ranges?.child;
        } else if (age > 60) {
            range = ranges?.geriatric;
        } else if (gender.toLowerCase() === 'male') {
            range = ranges?.male;
        } else {
            range = ranges?.female;
        }

        // Fallback to simpler logic or generic if specific range missing but others exist
        if (!range) {
            if (gender.toLowerCase() === 'male') range = ranges?.male;
            else range = ranges?.female;
        }

        if (range) {
            if (range.text) return range.text;
            if (range.min !== undefined || range.max !== undefined) return `${range.min} - ${range.max}`;
        }

        return test.normalRange || 'N/A';
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!sample) return <div className="p-10 text-center text-red-500">Sample not found</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black p-4 lg:p-8 pb-32 transition-all duration-500">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
                
                {/* Strategic Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none animate-pulse">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                Enter Lab Results
                            </h1>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                            Data Entry & Result Validation
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-[14px]">
                            <span className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">Sample ID</span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">#{sample.sampleId}</span>
                        </div>
                        <div className="px-5 py-2.5 bg-indigo-600 rounded-[14px] text-white">
                            <span className="text-[10px] font-black opacity-70 uppercase block tracking-widest">Sample Type</span>
                            <span className="text-sm font-black uppercase tracking-tight">{sample.sampleType}</span>
                        </div>
                    </div>
                </div>

                {/* Patient Details */}
                <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000"></div>
                    
                    <div className="relative flex flex-col md:flex-row md:items-center gap-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                                <span className="text-2xl font-black uppercase">{sample.patientDetails.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                    {sample.patientDetails.name}
                                </h2>
                                <div className="flex items-center gap-3 mt-1.5 font-bold text-gray-400 text-xs">
                                    <span className="uppercase tracking-wider">{sample.patientDetails.gender}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                                    <span>{sample.patientDetails.age} Years</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference ID</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">REF-{id.slice(-6).toUpperCase()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sample Type</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{sample.sampleType}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Contact</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">+{sample.patientDetails.mobile || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">{sample.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytical Domain Filter */}
                {(() => {
                    const departments = Array.from(new Set(testResults.map(t => t.departmentName).filter(Boolean)));
                    if (departments.length > 0) {
                        return (
                            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm w-fit max-w-full overflow-hidden">
                                 <button
                                    onClick={() => setSelectedDept('All')}
                                    className={`px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDept === 'All'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                        : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                >
                                    All Departments
                                </button>
                                {departments.map(dept => (
                                    <button
                                        key={dept}
                                        onClick={() => setSelectedDept(dept as string)}
                                        className={`px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDept === dept
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                            : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                            }`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Test Results Entry */}
                <div className="space-y-8 pb-12">
                    {testResults
                        .filter(t => selectedDept === 'All' || t.departmentName === selectedDept)
                        .map((test, index) => (
                            <div key={index} className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <div className="p-8 lg:p-10">
                                    {/* Protocol Header */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-gray-50 dark:border-gray-800">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                                    {test.testName}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 font-black text-gray-500 tabular-nums tracking-widest">
                                                        {test.testCode}
                                                    </span>
                                                    {test.departmentName && (
                                                        <span className="text-[10px] px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest">
                                                            {test.departmentName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                {test.method && test.method !== 'N/A' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        <span>Method: <span className="text-gray-700 dark:text-gray-300">{test.method}</span></span>
                                                    </div>
                                                )}
                                                 <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                    <span>Unit: <span className="text-gray-700 dark:text-gray-300">{test.unit || 'Standard'}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span>Price: <span className="text-emerald-600">₹{test.price}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        {!isCompleted && (
                                             <button
                                                onClick={() => handleAddSubTest(index)}
                                                className="px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                            >
                                                + Add Sub-Test
                                            </button>
                                        )}
                                    </div>

                                    {/* Core Data Input Matrix */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                                        {/* Result Magnitude */}
                                         <div className="lg:col-span-4 space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Result Value *</label>
                                            <div className="group relative">
                                                <input
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 text-gray-900 dark:text-white rounded-[24px] px-6 py-4 outline-none disabled:opacity-50 font-black text-xl tracking-tight transition-all placeholder:text-gray-300 tabular-nums"
                                                    placeholder="0.00"
                                                    value={test.resultValue || ''}
                                                    disabled={isCompleted}
                                                    onChange={(e) => handleResultChange(index, 'resultValue', e.target.value)}
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs uppercase group-focus-within:text-indigo-500 transition-colors">
                                                    {test.unit || 'VAL'}
                                                </div>
                                            </div>
                                             <div className="flex items-center gap-2 px-1">
                                                <Bookmark className="w-3 h-3 text-indigo-400" />
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                    Normal Range: {getDisplayRange(test)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Clinical Annotations */}
                                         <div className="lg:col-span-5 space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Remarks</label>
                                            <input
                                                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 text-gray-900 dark:text-white rounded-[24px] px-6 py-4 outline-none disabled:opacity-50 font-bold text-sm transition-all placeholder:text-gray-300"
                                                placeholder="OPTIONAL ANALYTICAL REMARKS..."
                                                value={test.remarks || ''}
                                                disabled={isCompleted}
                                                onChange={(e) => handleResultChange(index, 'remarks', e.target.value)}
                                            />
                                        </div>

                                         {/* Abnormal Toggle */}
                                        <div className="lg:col-span-3 space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Result Status</label>
                                            <div className={`flex items-center justify-between h-[60px] rounded-[24px] px-6 transition-all duration-500 border-2 ${
                                                test.isAbnormal 
                                                ? 'bg-rose-50 border-rose-200 shadow-lg shadow-rose-100 dark:shadow-none' 
                                                : 'bg-gray-50 dark:bg-gray-800 border-transparent'
                                            }`}>
                                                <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${test.isAbnormal ? 'text-rose-600' : 'text-gray-400'}`}>
                                                    Abnormal Result
                                                </span>
                                                <button
                                                    onClick={() => !isCompleted && handleResultChange(index, 'isAbnormal', !test.isAbnormal)}
                                                    className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${test.isAbnormal ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform cursor-pointer ${test.isAbnormal ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supplement Data Matrices (Sub Tests) */}
                                    {test.subTests && test.subTests.length > 0 && (
                                        <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-50 dark:border-gray-800 space-y-6">
                                             <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                                                    Sub-Test Parameters
                                                </h4>
                                            </div>
                                                                                        <div className="grid-cols-1 md:grid-cols-12 gap-6 px-4 py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest hidden md:grid">
                                                <div className="md:col-span-4">Parameter Name</div>
                                                <div className="md:col-span-2 text-center">Result</div>
                                                <div className="md:col-span-2 text-center">Unit</div>
                                                <div className="md:col-span-3 text-center">Normal Range</div>
                                                <div className="md:col-span-1 text-right">Actions</div>
                                            </div>

                                            <div className="space-y-4">
                                                {test.subTests.map((sub, sIndex) => (
                                                    <div key={sIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-black/20 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all shadow-sm">
                                                        <div className="md:col-span-4">
                                                            <input
                                                                className="w-full bg-transparent border-b border-transparent focus:border-indigo-600 px-2 py-1 text-sm font-bold text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-300"
                                                                placeholder="PARAMETER NAME..."
                                                                value={sub.name}
                                                                disabled={isCompleted}
                                                                onChange={(e) => handleSubTestChange(index, sIndex, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <input
                                                                className="w-full bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-center px-4 py-2.5 rounded-xl font-black text-sm outline-none transition-all placeholder:text-indigo-300"
                                                                placeholder="0.0"
                                                                value={sub.result}
                                                                disabled={isCompleted}
                                                                onChange={(e) => handleSubTestChange(index, sIndex, 'result', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <input
                                                                className="w-full bg-gray-50/50 dark:bg-gray-800/50 text-center px-4 py-2.5 rounded-xl font-bold text-xs text-gray-500 uppercase outline-none transition-all"
                                                                placeholder="UNIT"
                                                                value={sub.unit}
                                                                disabled={isCompleted}
                                                                onChange={(e) => handleSubTestChange(index, sIndex, 'unit', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <input
                                                                className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 text-center px-4 py-2.5 rounded-xl font-bold text-xs outline-none transition-all"
                                                                placeholder="REFERENCE RANGE"
                                                                value={sub.range || ''}
                                                                disabled={isCompleted}
                                                                onChange={(e) => handleSubTestChange(index, sIndex, 'range', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-1 flex justify-end">
                                                            {!isCompleted && (
                                                                <button
                                                                    onClick={() => removeSubTest(index, sIndex)}
                                                                    className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Tactical Command Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-50">
                 <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-[0_32px_128px_-15px_rgba(0,0,0,0.15)] rounded-[32px] p-4 flex items-center justify-between gap-6 px-10">
                    <div className="hidden md:flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Center</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Results Entry</span>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                         <button
                            onClick={() => router.back()}
                            className="flex-1 md:flex-none px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        
                        {sample.status === 'Completed' && (
                            <button
                                onClick={handlePrint}
                                className="flex-1 md:flex-none px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                            >
                                <Download size={14} /> Download Report
                            </button>
                        )}

                        {!isCompleted && (
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                            >
                                 {processing ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Submit Results</span>
                                        <ChevronRight size={14} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Analytical Rendering Component */}
            <div style={{ position: 'absolute', top: '-9999px' }}>
                <div ref={printRef}>
                    <ResultPrintView sample={{ ...sample, tests: testResults }} />
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
