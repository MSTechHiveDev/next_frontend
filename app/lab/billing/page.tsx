'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Printer, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { LabBillingService } from '@/lib/integrations/services/labBilling.service';
import { BillItem, PatientDetails, BillPayload } from '@/lib/integrations/types/labBilling';
import BillPrintView from '@/components/lab/BillPrintView';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';

import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { LabTest } from '@/lib/integrations/types/labTest';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { X, Check } from 'lucide-react';

export default function LabBillingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [testsLoading, setTestsLoading] = useState(true);
    const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
    const [generatedBill, setGeneratedBill] = useState<(BillPayload & { invoiceId: string; createdAt: string }) | null>(null);

    // Fetch tests on load
    React.useEffect(() => {
        const fetchTests = async () => {
            try {
                const data = await LabTestService.getTests();
                setAvailableTests(data);
            } catch (err) {
                console.error("Failed to load tests", err);
            } finally {
                setTestsLoading(false);
            }
        };
        fetchTests();
    }, []);

    // Helper to add tests from URL
    const searchParams = useSearchParams();

    // 1. Capture Patient & Sample params immediately
    React.useEffect(() => {
        const name = searchParams.get('name');
        const mobile = searchParams.get('mobile');
        const age = searchParams.get('age');
        const gender = searchParams.get('gender');
        const sampleIdParam = searchParams.get('sampleId');

        if (sampleIdParam) {
            console.log("Setting Sample ID:", sampleIdParam);
            setSampleId(sampleIdParam);
        }

        if (name || mobile) {
            setPatient(prev => ({
                ...prev,
                name: name || prev.name,
                mobile: mobile || prev.mobile,
                age: age ? parseInt(age) : prev.age,
                gender: (gender as any) || prev.gender,
            }));
        }
    }, [searchParams]);

    // 2. Map Test Names to Objects (Requires availableTests)
    React.useEffect(() => {
        if (!testsLoading && availableTests.length > 0) {
            const tests = searchParams.get('tests');
            if (tests) {
                const testList = tests.split(',');
                // Find matching tests
                const testsToAdd: BillItem[] = [];

                testList.forEach(tName => {
                    const found = availableTests.find(at =>
                        (at.testName && at.testName.toLowerCase() === tName.toLowerCase()) ||
                        (at.name && at.name.toLowerCase() === tName.toLowerCase())
                    );
                    if (found) {
                        testsToAdd.push({
                            testName: found.testName || found.name || "Unknown",
                            price: found.price,
                            discount: 0
                        });
                    }
                });

                if (testsToAdd.length > 0) {
                    // Filter out already selected to avoid dupes if effect runs twice
                    setSelectedTests(prev => {
                        const newTests = testsToAdd.filter(newT => !prev.some(existing => existing.testName === newT.testName));
                        return [...prev, ...newTests];
                    });
                }
            }
        }
    }, [testsLoading, availableTests, searchParams]);

    /* ----------------------------------------
       Patient State
    ----------------------------------------- */
    const [patient, setPatient] = useState<PatientDetails>({
        name: '',
        age: 0,
        ageUnit: 'Years',
        gender: '' as any,
        mobile: '',
        refDoctor: '',
    });
    const [sampleId, setSampleId] = useState<string | null>(null);

    const getAgeGroup = () => {
        const { age, ageUnit } = patient;
        if (!age) return 'N/A';

        if (ageUnit === 'Days') {
            return age <= 28 ? 'Newborn' : 'Infant';
        }
        if (ageUnit === 'Months') {
            return age <= 12 ? 'Infant' : 'Child';
        }
        // Years
        if (age <= 1) return 'Infant';
        if (age <= 12) return 'Child';
        if (age >= 60) return 'Geriatric';
        return 'Adult';
    };

    const [selectedTests, setSelectedTests] = useState<BillItem[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Mixed'>('Cash');
    const [mixedPayments, setMixedPayments] = useState({ cash: 0, card: 0, upi: 0 });

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

    const markTouched = (field: string) => {
        setTouchedFields(prev => {
            const next = new Set(prev);
            next.add(field);
            return next;
        });
    };

    // Watch for validation errors
    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        // Mobile: Exactly 10 digits
        if (!/^\d{10}$/.test(patient.mobile)) {
            newErrors.mobile = "Please enter a valid 10-digit mobile number";
        }

        // Age: Positive integers only 0-120
        // Relax check for days/months
        if (patient.age < 0 || !Number.isInteger(Number(patient.age))) {
            newErrors.age = "Invalid Age";
        }
        if (patient.ageUnit === 'Years' && patient.age > 120) newErrors.age = "Max 120 Years";

        // Gender: Mandatory
        if (!patient.gender) {
            newErrors.gender = "Gender is mandatory";
        }

        // Discount: Non-negative
        if (discount < 0) {
            newErrors.discount = "Discount value cannot be negative";
        } else if (discount > totalAmount) {
            newErrors.discount = "Discount cannot exceed total bill amount";
        }

        // Amount Paid: Non-negative
        if (paidAmount < 0) {
            newErrors.paidAmount = "Amount paid cannot be negative";
        }

        // Mixed Payments
        if (paymentMode === 'Mixed') {
            const { cash, card, upi } = mixedPayments;
            if (cash < 0 || card < 0 || upi < 0) {
                newErrors.mixed = "Payment amounts cannot be negative";
            }
            const totalMixed = Number(cash) + Number(card) + Number(upi);
            if (Math.abs(totalMixed - finalAmount) > 0.01) {
                newErrors.mixedMatch = "Total payment does not match amount paid";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    React.useEffect(() => {
        validate();
    }, [patient, discount, paidAmount, paymentMode, mixedPayments, selectedTests]);

    /* ----------------------------------------
       Calculations
    ----------------------------------------- */
    const totalAmount = selectedTests.reduce((sum, item) => sum + item.price, 0);
    const finalAmount = Math.max(0, totalAmount - discount);
    const balance = Math.max(0, finalAmount - paidAmount);

    // Auto-update paid amount and mixed payments
    React.useEffect(() => {
        setPaidAmount(finalAmount);
        if (paymentMode === 'Mixed') {
            setMixedPayments({ cash: finalAmount, card: 0, upi: 0 });
        }
    }, [finalAmount, paymentMode]);

    /* ----------------------------------------
       Print Setup
    ----------------------------------------- */
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: generatedBill ? `Invoice_${generatedBill.invoiceId}` : 'Invoice',
    });

    /* ----------------------------------------
       Handlers
    ----------------------------------------- */
    const handleAddTest = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const test = availableTests.find(t => t._id === e.target.value);
        if (!test) return;

        const nameToUse = test.testName || test.name || "Unknown Test";
        if (!selectedTests.find(t => t.testName === nameToUse)) {
            setSelectedTests([
                ...selectedTests,
                { testName: nameToUse, price: test.price, discount: 0 },
            ]);
        }
    };

    const removeTest = (index: number) => {
        const updated = [...selectedTests];
        updated.splice(index, 1);
        setSelectedTests(updated);
    };

    const handleGenerateBill = async (shouldPrint: boolean = true) => {
        if (!patient.name || !patient.mobile || selectedTests.length === 0) {
            toast.error('Please fill patient details and select tests');
            return;
        }

        if (paymentMode === 'Mixed') {
            const totalMixed = Number(mixedPayments.cash) + Number(mixedPayments.card) + Number(mixedPayments.upi);
            if (Math.abs(totalMixed - finalAmount) > 2) {
                toast.error(`Mixed payments (₹${totalMixed}) must match Total (₹${finalAmount})`);
                return;
            }
        }

        setLoading(true);
        try {
            // If sampleId exists, finalize the existing order instead of creating a new one
            if (sampleId) {
                console.log("Finalizing existing order:", sampleId);
                const res = await LabSampleService.finalizeOrder(sampleId, {
                    totalAmount: finalAmount
                });

                // Mark the transaction as paid
                await LabSampleService.payOrder(sampleId, {
                    paymentMode: paymentMode || 'Cash',
                    paymentDetails: paymentMode === 'Mixed' ? mixedPayments : undefined
                });

                setGeneratedBill({
                    patientDetails: patient,
                    items: selectedTests,
                    totalAmount,
                    discount,
                    finalAmount,
                    paidAmount,
                    balance,
                    paymentMode,
                    paymentDetails: paymentMode === 'Mixed' ? mixedPayments : undefined,
                    invoiceId: res.transaction._id || 'N/A',
                    createdAt: new Date().toISOString(),
                });

                toast.success('Payment recorded and bill generated!');
            } else {
                // Walk-in patient - create new bill/order
                const payload: BillPayload = {
                    patientDetails: patient,
                    items: selectedTests,
                    totalAmount,
                    discount,
                    finalAmount,
                    paidAmount,
                    balance,
                    paymentMode,
                    paymentDetails: paymentMode === 'Mixed' ? mixedPayments : undefined
                };

                const res = await LabBillingService.createBill(payload);

                setGeneratedBill({
                    ...payload,
                    invoiceId: res.bill.invoiceId,
                    createdAt: res.bill.createdAt,
                });

                toast.success('Bill generated successfully!');
            }

            if (shouldPrint) {
                // Trigger print
                setTimeout(() => {
                    handlePrint();
                }, 500);
            }
            // Do NOT redirect here. Let user click "Close" or "Print".
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Billing failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        if (sampleId && !generatedBill) {
            // Only update status if bill wasn't generated (finalizeOrder already marks as completed)
            console.log("Closing sample without billing:", sampleId);
            try {
                await LabSampleService.updateResults(sampleId, { status: 'Completed' });
                toast.success('Sample marked as Completed');
            } catch (error) {
                console.error("Failed to update sample status", error);
            }
        } else if (generatedBill) {
            console.log("Closing completed billing session");
            toast.success('Billing completed!');
        } else {
            console.warn("No sampleId found in state, cannot mark as completed.");
        }
        router.push('/lab/active-tests');
    };

    /* ----------------------------------------
       UI
    ----------------------------------------- */
    return (
        <div className="p-8 bg-gray-50/50 dark:bg-gray-900 min-h-screen transition-colors duration-500 w-full max-w-[100vw] overflow-x-hidden">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Lab Billing</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient Info */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5 transition-colors">
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-2">Patient Details</h3>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Patient Name</label>
                        <input
                            placeholder="Enter patient name"
                            className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium dark:text-white"
                            value={patient.name}
                            onChange={e => setPatient({ ...patient, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Age & Unit</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Age"
                                    min="0"
                                    className={`w-1/2 bg-gray-50/50 dark:bg-gray-900 border ${errors.age ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'} rounded-xl px-4 py-3 outline-none transition-all font-medium dark:text-white`}
                                    value={patient.age || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === '' || (/^\d+$/.test(val))) {
                                            setPatient({ ...patient, age: val === '' ? 0 : parseInt(val) });
                                        }
                                    }}
                                />
                                <select
                                    className="w-1/2 bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 outline-none transition-all font-medium dark:text-white"
                                    value={patient.ageUnit}
                                    onChange={e => setPatient({ ...patient, ageUnit: e.target.value as any })}
                                >
                                    <option value="Years">Years</option>
                                    <option value="Months">Months</option>
                                    <option value="Days">Days</option>
                                </select>
                            </div>
                            <div className="mt-1 ml-1 flex items-center gap-2">
                                {errors.age && <p className="text-[10px] text-red-500 font-bold">{errors.age}</p>}
                                {!errors.age && patient.age > 0 && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                                        Group: {getAgeGroup()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Gender</label>
                            <div className="flex bg-gray-50 dark:bg-gray-900 items-center justify-between gap-1 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                                {['Male', 'Female', 'Other'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => {
                                            setPatient({ ...patient, gender: g as any });
                                            markTouched('gender');
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${patient.gender === g ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                            {touchedFields.has('gender') && errors.gender && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.gender}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Mobile</label>
                        <input
                            placeholder="Enter 10-digit mobile"
                            maxLength={10}
                            className={`w-full bg-gray-50/50 dark:bg-gray-900 border ${touchedFields.has('mobile') && errors.mobile ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'} rounded-xl px-4 py-3 outline-none transition-all font-medium dark:text-white`}
                            value={patient.mobile}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                    setPatient({ ...patient, mobile: val });
                                }
                            }}
                            onBlur={() => markTouched('mobile')}
                        />
                        {touchedFields.has('mobile') && errors.mobile && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.mobile}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Ref Doctor</label>
                        <input
                            placeholder="Referring doctor name"
                            className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium dark:text-white"
                            value={patient.refDoctor}
                            onChange={e => setPatient({ ...patient, refDoctor: e.target.value })}
                        />
                    </div>
                </div>

                {/* Tests Selection */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col transition-colors">
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-6">Select Tests</h3>

                    <div className="relative mb-6">
                        <select
                            className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none dark:text-white"
                            onChange={handleAddTest}
                            value=""
                        >
                            <option value="" disabled className="dark:text-gray-400">
                                {testsLoading ? 'Loading tests...' : 'Select Test'}
                            </option>
                            {availableTests.map(t => (
                                <option key={t._id} value={t._id} className="dark:bg-gray-800 dark:text-white">
                                    {t.testName || t.name} - ₹{t.price}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {availableTests.map((test) => {
                            const currentName = test.testName || test.name || "Unknown Test";
                            const isSelected = selectedTests.some(t => t.testName === currentName);
                            // Show details if selected? Actually the user said "display ... in the Lab Billing page".
                            // I will show them in the list always, or just when selected.
                            // The availableTests map iterate over ALL tests. I should show Method/TAT here for reference.

                            return (
                                <div
                                    key={test._id}
                                    onClick={() => {
                                        const nameToUse = test.testName || test.name || "Unknown Test";
                                        if (isSelected) {
                                            const idx = selectedTests.findIndex(t => t.testName === nameToUse);
                                            removeTest(idx);
                                        } else {
                                            setSelectedTests([...selectedTests, { testName: nameToUse, price: test.price, discount: 0 }]);
                                        }
                                    }}
                                    className={`flex justify-between items-start p-4 rounded-xl mb-2 cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm leading-tight mb-1 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {test.testName || test.name}
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                        Sample: <span className="text-gray-600 dark:text-gray-400">{test.sampleType || 'N/A'}</span>
                                                    </span>
                                                    {test.departmentId && (
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                                                            | {(typeof test.departmentId === 'object' ? test.departmentId.name : 'Lab')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 items-center text-[10px]">
                                                    {test.method && (
                                                        <span className="font-medium text-gray-400 uppercase">Method: <span className="text-gray-600 dark:text-gray-300">{test.method}</span></span>
                                                    )}
                                                    {test.turnaroundTime && (
                                                        <span className="font-medium text-gray-400 uppercase ml-1">TAT: <span className="text-gray-600 dark:text-gray-300">{test.turnaroundTime}</span></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`font-black text-sm whitespace-nowrap pt-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>₹{test.price}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment & Summary */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 transition-colors">
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-2">Payment</h3>

                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-gray-200">Total:</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">₹{totalAmount}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Discount</label>
                        <input
                            type="number"
                            placeholder="0"
                            min="0"
                            className={`w-full bg-gray-50/50 dark:bg-gray-900 border ${errors.discount ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'} rounded-xl px-4 py-3 outline-none transition-all font-black text-lg text-right dark:text-white`}
                            value={discount || ''}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || (parseFloat(val) >= 0)) {
                                    setDiscount(val === '' ? 0 : parseFloat(val));
                                }
                            }}
                        />
                        {errors.discount && <p className="text-[10px] text-red-500 font-bold mt-1 text-right">{errors.discount}</p>}
                    </div>

                    <div className="flex justify-between items-center border-t border-dashed dark:border-gray-700 pt-4">
                        <span className="font-bold text-green-600 text-lg uppercase">Final:</span>
                        <span className="text-2xl font-black text-green-600">₹{finalAmount}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Amount Paid</label>
                        <input
                            type="number"
                            placeholder="0"
                            min="0"
                            className={`w-full bg-gray-50/50 dark:bg-gray-900 border ${errors.paidAmount ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'} rounded-xl px-4 py-3 outline-none transition-all font-black text-lg text-right dark:text-white`}
                            value={paidAmount || ''}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || (parseFloat(val) >= 0)) {
                                    setPaidAmount(val === '' ? 0 : parseFloat(val));
                                }
                            }}
                        />
                        {errors.paidAmount && <p className="text-[10px] text-red-500 font-bold mt-1 text-right">{errors.paidAmount}</p>}
                    </div>

                    <div className="flex justify-between items-center bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 border-dashed">
                        <span className="font-bold text-orange-600 dark:text-orange-400 uppercase">Balance:</span>
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{balance}</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Cash', 'UPI', 'Card', 'Mixed'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setPaymentMode(mode as any)}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${paymentMode === mode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-700 dark:text-gray-400'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMode === 'Mixed' && (
                        <div className="space-y-3 p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 border-dashed">
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Split Amount</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-12">CASH</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-right dark:text-white"
                                        value={mixedPayments.cash || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setMixedPayments({ ...mixedPayments, cash: val === '' ? 0 : parseFloat(val) });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-12">UPI</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-right dark:text-white"
                                        value={mixedPayments.upi || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setMixedPayments({ ...mixedPayments, upi: val === '' ? 0 : parseFloat(val) });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-12">CARD</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-right dark:text-white"
                                        value={mixedPayments.card || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setMixedPayments({ ...mixedPayments, card: val === '' ? 0 : parseFloat(val) });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/30 flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
                                        <span className="text-gray-400">Total Mixed:</span>
                                        <span className={errors.mixedMatch ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}>
                                            ₹{mixedPayments.cash + mixedPayments.upi + mixedPayments.card} / ₹{finalAmount}
                                        </span>
                                    </div>
                                    {(errors.mixed || errors.mixedMatch) && (
                                        <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
                                            {errors.mixed || errors.mixedMatch}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                        {/* 3 Buttons: Save, Print, Close */}
                        {!generatedBill ? (
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleGenerateBill(false)}
                                    disabled={loading || Object.keys(errors).length > 0 || selectedTests.length === 0}
                                    className="group flex flex-col items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-gray-600 rounded-2xl text-blue-700 dark:text-blue-400 font-bold transition-all hover:shadow-lg hover:scale-[1.02] hover:border-blue-400 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <Save className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <div className="text-sm font-bold">Save Bill</div>
                                        <div className="text-[10px] font-normal opacity-70">Save without printing</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleGenerateBill(true)}
                                    disabled={loading || Object.keys(errors).length > 0 || selectedTests.length === 0}
                                    className="group flex flex-col items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-300/50 dark:shadow-indigo-900/50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Printer className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="text-center">
                                        <div className="text-sm font-bold">{loading ? 'Processing...' : 'Generate & Print'}</div>
                                        <div className="text-[10px] font-normal opacity-90">Save and print invoice</div>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <button
                                    onClick={handlePrint}
                                    className="group flex flex-col items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold hover:shadow-lg hover:scale-[1.02] hover:border-gray-400 transition-all"
                                >
                                    <Printer className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <div className="text-sm font-bold">Print Invoice</div>
                                        <div className="text-[10px] font-normal opacity-70">Print again if needed</div>
                                    </div>
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="group flex flex-col items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-300/50 dark:shadow-emerald-900/50 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <Check className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <div className="text-sm font-bold">Complete & Close</div>
                                        <div className="text-[10px] font-normal opacity-90">Finish this order</div>
                                    </div>
                                </button>
                            </div>
                        )}
                        {generatedBill && (
                            <p className="text-center text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">
                                <Check size={12} className="inline mr-1" />
                                Bill Saved Successfully
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Print Area */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef}>
                    {generatedBill && (
                        <BillPrintView
                            billData={generatedBill}
                            invoiceId={generatedBill.invoiceId}
                        />
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
