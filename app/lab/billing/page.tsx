'use client';

import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LabBillingService } from '@/lib/integrations/services/labBilling.service';
import { BillItem, PatientDetails, BillPayload } from '@/lib/integrations/types/labBilling';
import BillPrintView from '@/components/lab/BillPrintView';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';

import { LabTestService } from '@/lib/integrations/services/labTest.service';
import { LabTest } from '@/lib/integrations/types/labTest';

export default function LabBillingPage() {
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

    /* ----------------------------------------
       Patient State
    ----------------------------------------- */
    const [patient, setPatient] = useState<PatientDetails>({
        name: '',
        age: 0,
        gender: 'Male',
        mobile: '',
        refDoctor: '',
    });

    const [selectedTests, setSelectedTests] = useState<BillItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');

    /* ----------------------------------------
       Calculations
    ----------------------------------------- */
    const totalAmount = selectedTests.reduce((sum, item) => sum + item.price, 0);
    const finalAmount = Math.max(0, totalAmount - discount);
    const balance = Math.max(0, finalAmount - paidAmount);

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

        if (!selectedTests.find(t => t.testName === test.name)) {
            setSelectedTests([
                ...selectedTests,
                { testName: test.name, price: test.price, discount: 0 },
            ]);
        }
    };

    const removeTest = (index: number) => {
        const updated = [...selectedTests];
        updated.splice(index, 1);
        setSelectedTests(updated);
    };

    const handleGenerateBill = async () => {
        if (!patient.name || !patient.mobile || selectedTests.length === 0) {
            toast.error('Please fill patient details and select tests');
            return;
        }

        setLoading(true);
        try {
            const payload: BillPayload = {
                patientDetails: patient,
                items: selectedTests,
                totalAmount,
                discount,
                finalAmount,
                paidAmount,
                balance,
                paymentMode,
            };

            const res = await LabBillingService.createBill(payload);

            setGeneratedBill({
                ...payload,
                invoiceId: res.bill.invoiceId,
                createdAt: res.bill.createdAt,
            });

            toast.success('Bill generated successfully!');

            // Trigger print after state update
            setTimeout(() => {
                handlePrint();
            }, 300);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Billing failed');
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------------------
       UI
    ----------------------------------------- */
    return (
        <div className="p-8 bg-gray-50/50 min-h-screen">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Lab Billing</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient Info */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-2">Patient Details</h3>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Patient Name</label>
                        <input
                            placeholder="Enter patient name"
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            value={patient.name}
                            onChange={e => setPatient({ ...patient, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Age</label>
                            <input
                                type="number"
                                placeholder="Age"
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                value={patient.age || ''}
                                onChange={e => setPatient({ ...patient, age: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">&nbsp;</label>
                            <select
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                                value={patient.gender}
                                onChange={e => setPatient({ ...patient, gender: e.target.value as any })}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Mobile</label>
                        <input
                            placeholder="Enter mobile number"
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            value={patient.mobile}
                            onChange={e => setPatient({ ...patient, mobile: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-1.5 ml-1">Ref Doctor</label>
                        <input
                            placeholder="Referring doctor name"
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            value={patient.refDoctor}
                            onChange={e => setPatient({ ...patient, refDoctor: e.target.value })}
                        />
                    </div>
                </div>

                {/* Tests Selection */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-6">Select Tests</h3>

                    <div className="relative mb-6">
                        <select
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                            onChange={handleAddTest}
                            value=""
                        >
                            <option value="" disabled>
                                {testsLoading ? 'Loading tests...' : 'Select Test'}
                            </option>
                            {availableTests.map(t => (
                                <option key={t._id} value={t._id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {availableTests.map((test) => {
                            const isSelected = selectedTests.some(t => t.testName === test.name);
                            return (
                                <div
                                    key={test._id}
                                    onClick={() => {
                                        if (isSelected) {
                                            const idx = selectedTests.findIndex(t => t.testName === test.name);
                                            removeTest(idx);
                                        } else {
                                            setSelectedTests([...selectedTests, { testName: test.name, price: test.price, discount: 0 }]);
                                        }
                                    }}
                                    className={`flex justify-between items-center p-4 rounded-xl mb-2 cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{test.name}</p>
                                    </div>
                                    <p className={`font-black text-sm ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>₹{test.price}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment & Summary */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-2">Payment</h3>

                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Total:</span>
                        <span className="text-xl font-black text-gray-900">₹{totalAmount}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Discount</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-lg text-right"
                            value={discount || ''}
                            onChange={e => setDiscount(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex justify-between items-center border-t border-dashed pt-4">
                        <span className="font-bold text-green-600 text-lg uppercase">Final:</span>
                        <span className="text-2xl font-black text-green-600">₹{finalAmount}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Amount Paid</label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-lg text-right"
                            value={paidAmount || ''}
                            onChange={e => setPaidAmount(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex justify-between items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100 border-dashed">
                        <span className="font-bold text-orange-600 uppercase">Balance:</span>
                        <span className="text-2xl font-black text-orange-600">₹{balance}</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Cash', 'UPI', 'Card'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setPaymentMode(mode as any)}
                                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${paymentMode === mode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateBill}
                        disabled={loading}
                        className="mt-4 w-full bg-[#b388ff] text-white py-4 rounded-2xl font-black uppercase tracking-[2px] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Generate Bill'}
                    </button>
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
