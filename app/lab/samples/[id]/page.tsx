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
            // Transition to Completed after result entry
            const newStatus = 'Completed';

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
            router.push('/lab/samples');
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
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen pb-32 transition-colors duration-500">
            {/* Header / Breadcrumb */}
            <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Entering Results For</h2>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sample.patientDetails.name}</h1>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex gap-3">
                        <span>Sample ID: <span className="font-semibold text-black dark:text-white">{sample.sampleId}</span></span>
                        <span>•</span>
                        <span>{sample.patientDetails.age}Y / {sample.patientDetails.gender}</span>
                    </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-lg text-right">
                    <span className="text-purple-800 dark:text-purple-300 text-xs font-bold uppercase block mb-1">Sample Type</span>
                    <span className="text-purple-900 dark:text-purple-200 font-semibold">{sample.sampleType}</span>
                </div>
            </div>

            {/* Department Filter */}
            {(() => {
                const departments = Array.from(new Set(testResults.map(t => t.departmentName).filter(Boolean)));
                if (departments.length > 0) {
                    return (
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            <button
                                onClick={() => setSelectedDept('All')}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedDept === 'All'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All Departments
                            </button>
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept as string)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedDept === dept
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
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

            {/* Test Cards */}
            <div className="space-y-6 mb-8">
                {testResults
                    .filter(t => selectedDept === 'All' || t.departmentName === selectedDept)
                    .map((test, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{test.testName} {test.shortName ? `(${test.shortName})` : ''}</h3>
                                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 font-mono text-gray-600 dark:text-gray-300">
                                                {test.testCode}
                                            </span>
                                            {test.departmentName && (
                                                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold uppercase">
                                                    {test.departmentName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wide font-medium">
                                            {test.method && test.method !== 'N/A' && (
                                                <div><span className="font-bold text-gray-700 dark:text-gray-300">Method:</span> {test.method}</div>
                                            )}
                                            {test.unit && test.unit !== 'N/A' && (
                                                <div><span className="font-bold text-gray-700 dark:text-gray-300">Unit:</span> {test.unit}</div>
                                            )}
                                            <div><span className="font-bold text-gray-700 dark:text-gray-300">Sample:</span> {sample.sampleType}</div>
                                            <div><span className="font-bold text-gray-700 dark:text-gray-300">Price:</span> ₹{test.price}</div>
                                        </div>
                                        <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                            Standard Range: {getDisplayRange(test)}
                                        </div>
                                    </div>
                                    {!isCompleted && (
                                        <button
                                            onClick={() => handleAddSubTest(index)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-none shadow-sm hover:bg-indigo-700"
                                        >
                                            + Add Sub Test
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
                                    {/* Result Value */}
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Result Value *</label>
                                        <input
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 font-bold transition-colors"
                                            placeholder="Enter main value"
                                            value={test.resultValue || ''}
                                            disabled={isCompleted}
                                            onChange={(e) => handleResultChange(index, 'resultValue', e.target.value)}
                                        />
                                    </div>

                                    {/* Remarks */}
                                    <div className="md:col-span-5">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Remarks</label>
                                        <input
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                                            placeholder="Optional remarks"
                                            value={test.remarks || ''}
                                            disabled={isCompleted}
                                            onChange={(e) => handleResultChange(index, 'remarks', e.target.value)}
                                        />
                                    </div>

                                    {/* Abnormal Toggle */}
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Auto Status</label>
                                        <div className="flex items-center h-[46px] bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 px-3 transition-colors">
                                            <label className="flex items-center cursor-pointer select-none space-x-3 w-full">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-none disabled:opacity-50"
                                                    checked={test.isAbnormal}
                                                    disabled={isCompleted}
                                                    onChange={(e) => handleResultChange(index, 'isAbnormal', e.target.checked)}
                                                />
                                                <span className={`text-xs font-black tracking-tighter ${test.isAbnormal ? 'text-red-600 dark:text-red-400' : 'text-gray-500/50 dark:text-gray-500'} uppercase`}>
                                                    ⚠️ Mark Abnormal
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub Tests Parameters */}
                                {test.subTests && test.subTests.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                                            Sub Test Parameters
                                        </h4>
                                        <div className="space-y-3">
                                            {test.subTests.map((sub, sIndex) => (
                                                <div key={sIndex} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
                                                    <div className="md:col-span-4">
                                                        <input
                                                            className="w-full border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2 text-sm outline-none disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-colors"
                                                            placeholder="Sub-test Name"
                                                            value={sub.name}
                                                            disabled={isCompleted}
                                                            onChange={(e) => handleSubTestChange(index, sIndex, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <input
                                                            className="w-full border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2 text-sm outline-none disabled:bg-gray-50 dark:disabled:bg-gray-700 font-bold transition-colors"
                                                            placeholder="Result"
                                                            value={sub.result}
                                                            disabled={isCompleted}
                                                            onChange={(e) => handleSubTestChange(index, sIndex, 'result', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <input
                                                            className="w-full border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2 text-sm outline-none disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-colors"
                                                            placeholder="Units"
                                                            value={sub.unit}
                                                            disabled={isCompleted}
                                                            onChange={(e) => handleSubTestChange(index, sIndex, 'unit', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <input
                                                            className="w-full border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2 text-sm outline-none disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-colors"
                                                            placeholder="Ref range"
                                                            value={sub.range || ''}
                                                            disabled={isCompleted}
                                                            onChange={(e) => handleSubTestChange(index, sIndex, 'range', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1 flex justify-end">
                                                        {!isCompleted && (
                                                            <button
                                                                onClick={() => removeSubTest(index, sIndex)}
                                                                className="text-red-400 hover:text-red-500 p-1 transition-none"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

            {/* Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-4 z-10 md:pl-64 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
                {sample.status === 'Completed' && (
                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded font-bold transition-all hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                        <span>⬇ DOWNLOAD RESULT</span>
                    </button>
                )}

                {!isCompleted && (
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-70"
                    >
                        {processing ? 'SAVING...' : 'REPORT SUBMISSION'}
                    </button>
                )}
            </div>

            {/* Hidden Print Component */}
            <div style={{ position: 'absolute', top: '-9999px' }}>
                <div ref={printRef}>
                    <ResultPrintView sample={{ ...sample, tests: testResults }} />
                </div>
            </div>
            {/* Padding for fixed footer */}
            <div className="h-20"></div>
        </div>
    );
}
