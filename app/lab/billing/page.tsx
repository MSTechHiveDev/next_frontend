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
            console.log("Setting Order ID (DB):", sampleIdParam);
            setSampleId(sampleIdParam);
        }

        const displayIdParam = searchParams.get('displayId');
        if (displayIdParam) {
            setDisplayId(displayIdParam);
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
    const [displayId, setDisplayId] = useState<string | null>(null);

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

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Save className="w-5 h-5 text-white" />
                        </div>
                        Lab Billing
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        Billing & <span className="text-indigo-600 dark:text-indigo-400">Transaction Control</span>
                    </p>
                </div>

                {sampleId && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Active Order: {displayId || sampleId}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Column 1: Patient & Tests */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Patient Info Card */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-2 h-6 bg-indigo-600 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">Patient Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Patient Name</label>
                                <input
                                    placeholder="Enter patient name"
                                    className="w-full bg-gray-50/50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all font-semibold dark:text-white shadow-xs"
                                    value={patient.name}
                                    onChange={e => setPatient({ ...patient, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <input
                                    placeholder="10-digit mobile"
                                    maxLength={10}
                                    className={`w-full bg-gray-50/50 dark:bg-gray-900 border ${touchedFields.has('mobile') && errors.mobile ? 'border-amber-400 focus:border-amber-500' : 'border-transparent focus:border-indigo-500'} focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all font-semibold dark:text-white shadow-xs`}
                                    value={patient.mobile}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === '' || /^\d+$/.test(val)) {
                                            setPatient({ ...patient, mobile: val });
                                        }
                                    }}
                                    onBlur={() => markTouched('mobile')}
                                />
                                {touchedFields.has('mobile') && errors.mobile && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight ml-4">{errors.mobile}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Age Details</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Age"
                                        min="0"
                                        className={`w-24 bg-gray-50/50 dark:bg-gray-900 border ${errors.age ? 'border-amber-400 focus:border-amber-500' : 'border-transparent focus:border-indigo-500'} focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all font-semibold dark:text-white shadow-xs center-input`}
                                        value={patient.age || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || (/^\d+$/.test(val))) {
                                                setPatient({ ...patient, age: val === '' ? 0 : parseInt(val) });
                                            }
                                        }}
                                    />
                                    <select
                                        className="flex-1 bg-gray-50/50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all font-semibold dark:text-white shadow-xs cursor-pointer appearance-none"
                                        value={patient.ageUnit}
                                        onChange={e => setPatient({ ...patient, ageUnit: e.target.value as any })}
                                    >
                                        <option value="Years">Years (Adult/Geriatric)</option>
                                        <option value="Months">Months (Infant)</option>
                                        <option value="Days">Days (Neonatal)</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    {errors.age && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight">{errors.age}</p>}
                                    {patient.age > 0 && (
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500">
                                            Classification: {getAgeGroup()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                <div className="grid grid-cols-3 gap-2 bg-gray-50/50 dark:bg-gray-900 p-1.5 rounded-2xl">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => {
                                                setPatient({ ...patient, gender: g as any });
                                                markTouched('gender');
                                            }}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${patient.gender === g ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                {touchedFields.has('gender') && errors.gender && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight ml-4">{errors.gender}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Referral / Doctor</label>
                                <input
                                    placeholder="Doctor or Department name"
                                    className="w-full bg-gray-50/50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all font-semibold dark:text-white shadow-xs"
                                    value={patient.refDoctor}
                                    onChange={e => setPatient({ ...patient, refDoctor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tests Selection Card */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm transition-all min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-6 bg-indigo-600 rounded-full" />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">Select Lab Tests</h3>
                            </div>
                            <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-[3px] bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full">{selectedTests.length} ITEMS SELECTED</span>
                        </div>

                        <div className="relative group mb-8">
                            <select
                                className="w-full bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl px-6 py-5 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-indigo-700 dark:text-indigo-400 appearance-none cursor-pointer"
                                onChange={handleAddTest}
                                value=""
                            >
                                <option value="" disabled className="dark:text-gray-400">
                                    {testsLoading ? 'Loading Tests...' : 'Select Test'}
                                </option>
                                {availableTests.map(t => (
                                    <option key={t._id} value={t._id} className="dark:bg-gray-800 dark:text-white py-2">
                                        {t.testName || t.name} — [₹{t.price}]
                                    </option>
                                ))}
                            </select>
                            <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {availableTests.map((test) => {
                                const currentName = test.testName || test.name || "Unknown Test";
                                const isSelected = selectedTests.some(t => t.testName === currentName);

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
                                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                                            isSelected
                                                ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none'
                                                : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                                        }`}
                                    >
                                        <div className="relative z-10 flex justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-sm tracking-tight mb-2 truncate ${isSelected ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                                                    {test.testName || test.name}
                                                </p>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                            {test.sampleType || 'Type'}
                                                        </span>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                                            {(typeof test.departmentId === 'object' ? test.departmentId.name : 'GEN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>₹{test.price}</p>
                                                {isSelected && <CheckCircle className="w-4 h-4 text-white/50 ml-auto mt-2" />}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Save className="w-16 h-16 -mr-4 -mt-4 rotate-12" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Column 2: Financial Summary */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-lg transition-all sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest">Payment Summary</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{totalAmount}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Discount (₹)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        className={`w-full bg-gray-50/50 dark:bg-gray-900 border ${errors.discount ? 'border-amber-400' : 'border-transparent'} focus:border-indigo-500 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-xl text-right dark:text-white shadow-xs`}
                                        value={discount || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || (parseFloat(val) >= 0)) {
                                                setDiscount(val === '' ? 0 : parseFloat(val));
                                            }
                                        }}
                                    />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
                                </div>
                                {errors.discount && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight text-right pr-2">{errors.discount}</p>}
                            </div>

                            <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-6 rounded-[24px] border border-emerald-100/50 dark:border-emerald-900/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Net Payable</span>
                                    <span className="text-3xl font-bold text-emerald-600">₹{finalAmount}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Amount Paid</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        className={`w-full bg-gray-50/50 dark:bg-gray-900 border ${errors.paidAmount ? 'border-amber-400' : 'border-transparent'} focus:border-indigo-500 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-xl text-right dark:text-white shadow-xs`}
                                        value={paidAmount || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '' || (parseFloat(val) >= 0)) {
                                                setPaidAmount(val === '' ? 0 : parseFloat(val));
                                            }
                                        }}
                                    />
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
                                </div>
                                {errors.paidAmount && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight text-right pr-2">{errors.paidAmount}</p>}
                            </div>

                            <div className="flex justify-between items-center px-4 py-3 bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Outstanding</span>
                                <span className="text-xl font-bold text-amber-600 tracking-tight">₹{balance}</span>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-2">Payment Mode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Cash', 'UPI', 'Card', 'Mixed'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setPaymentMode(mode as any)}
                                            className={`p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                                paymentMode === mode
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                                                    : 'bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 border-gray-100 dark:border-gray-800'
                                            }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {paymentMode === 'Mixed' && (
                                <div className="space-y-4 p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 border-dashed animate-in fade-in zoom-in-95 duration-300">
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2 text-center">Payment Split</p>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'CASH', key: 'cash' },
                                            { label: 'UPI', key: 'upi' },
                                            { label: 'CARD', key: 'card' }
                                        ].map((pM) => (
                                            <div key={pM.key} className="flex items-center gap-4">
                                                <span className="text-[9px] font-bold text-gray-400 w-10">{pM.label}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-right dark:text-white"
                                                    value={(mixedPayments as any)[pM.key] || ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val === '' || parseFloat(val) >= 0) {
                                                            setMixedPayments({ ...mixedPayments, [pM.key]: val === '' ? 0 : parseFloat(val) });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                                            <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
                                                <span className="text-gray-400">Aggregated:</span>
                                                <span className={errors.mixedMatch ? 'text-amber-600' : 'text-indigo-600 dark:text-indigo-400'}>
                                                    ₹{mixedPayments.cash + mixedPayments.upi + mixedPayments.card} / ₹{finalAmount}
                                                </span>
                                            </div>
                                            {(errors.mixed || errors.mixedMatch) && (
                                                <p className="text-[8px] text-amber-600 font-bold uppercase tracking-tight mt-1 text-center">
                                                    {errors.mixed || errors.mixedMatch}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 space-y-4">
                                {!generatedBill ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => handleGenerateBill(true)}
                                            disabled={loading || Object.keys(errors).length > 0 || selectedTests.length === 0}
                                            className="w-full group relative flex items-center justify-center gap-4 px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-bold shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                 <>
                                                    <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
                                                    <div className="flex flex-col items-start leading-tight">
                                                        <span className="text-sm font-bold tracking-tight">Save and Print Invoice</span>
                                                        <span className="text-[10px] font-medium opacity-70">Finalize & Print</span>
                                                    </div>
                                                </>
                                            )}
                                        </button>

                                         <button
                                            onClick={() => handleGenerateBill(false)}
                                            disabled={loading || Object.keys(errors).length > 0 || selectedTests.length === 0}
                                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-40"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save (No Print)
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-700">
                                        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 mb-4">
                                            <CheckCircle className="w-6 h-6" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase tracking-widest">Billing Completed</span>
                                                <span className="text-[10px] font-medium opacity-70">ID: {generatedBill.invoiceId}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={handlePrint}
                                                className="flex flex-col items-center gap-2 p-5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] text-gray-500 hover:text-indigo-600 transition-all group"
                                            >
                                                <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">Reprint</span>
                                            </button>
                                            <button
                                                onClick={handleClose}
                                                className="flex flex-col items-center gap-2 p-5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-[24px] text-white shadow-lg shadow-emerald-100 dark:shadow-none transition-all group"
                                            >
                                                <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">Close</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .center-input {
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
