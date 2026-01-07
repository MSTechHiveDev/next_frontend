'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    Printer, 
    Eye, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Calendar,
    CreditCard,
    Plus
} from 'lucide-react';
import { PharmacyBillingService } from '@/lib/integrations/services/pharmacyBilling.service';
import { PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';
import PharmacyBillPrint from '@/components/pharmacy/billing/PharmacyBillPrint';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import Link from 'next/navigation';

const TransactionsPage = () => {
    const [bills, setBills] = useState<PharmacyBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBills, setTotalBills] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All Methods');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    
    const [selectedBill, setSelectedBill] = useState<PharmacyBill | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: selectedBill ? `Invoice_${selectedBill.invoiceId}` : 'Invoice',
    });

    const fetchBills = async (page = 1) => {
        setLoading(true);
        try {
            const data = await PharmacyBillingService.getBills(
                page, 
                10, 
                searchTerm, 
                paymentFilter, 
                dateFilter
            );
            setBills(data.bills);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalBills(data.totalBills);
        } catch (error) {
            console.error('Failed to fetch bills:', error);
            toast.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    // Debounced search and filter change effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBills(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, paymentFilter, dateFilter]);

    useEffect(() => {
        fetchBills(currentPage);
    }, [currentPage]);

    const onPrintClick = (bill: PharmacyBill) => {
        setSelectedBill(bill);
        setTimeout(() => {
            handlePrint();
        }, 300);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        
        try {
            await PharmacyBillingService.deleteBill(id);
            toast.success('Invoice deleted successfully');
            fetchBills(currentPage);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete invoice');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Partial': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Due': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-black text-emerald-600 tracking-tight">Invoices</h1>
                    <p className="text-gray-500 font-bold mt-1 text-base">Manage and view all invoices</p>
                </div>
        
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-emerald-500 transition-all font-medium text-sm text-gray-400"
                        placeholder="Search by invoice number..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Payment Mode</span>
                        </div>
                        <div className="relative">
                            <select 
                                className="bg-white dark:bg-gray-800 border-2 border-emerald-500 rounded-2xl px-4 py-2.5 text-[13px] font-bold outline-none transition-all pr-12 appearance-none min-w-[180px] text-gray-700 dark:text-gray-200"
                                value={paymentFilter}
                                onChange={e => setPaymentFilter(e.target.value)}
                            >
                                <option>All Methods</option>
                                <option>Cash</option>
                                <option>Card</option>
                                <option>UPI</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronLeft className="w-4 h-4 text-emerald-500 -rotate-90 stroke-[3px]" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Filter by Date</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="date"
                                className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-[13px] font-bold outline-none focus:border-emerald-500 transition-all text-gray-400"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices List Container */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                {/* Pagination Stats & Controls Top */}
                <div className="flex items-center justify-between px-8 py-6">
                    <p className="text-[13px] font-bold text-gray-500">
                        Page <span className="text-emerald-600 font-black">{currentPage}</span> of <span className="font-black text-gray-800">{totalPages}</span> ({((currentPage-1)*10)+1}-{Math.min(currentPage*10, totalBills)} of {totalBills})
                    </p>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 transition-all disabled:opacity-30 text-gray-400 hover:text-emerald-500"
                        >
                            <ChevronLeft className="w-6 h-6 stroke-[3px]" />
                        </button>
                        <div className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-100">
                            {currentPage} / {totalPages}
                        </div>
                        <button 
                             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                             disabled={currentPage === totalPages}
                             className="p-2 transition-all disabled:opacity-30 text-gray-400 hover:text-emerald-500"
                        >
                            <ChevronRight className="w-6 h-6 stroke-[3px]" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Invoice #</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Date</th>
                                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Patient</th>
                                <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Payment Method</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Amount</th>
                                <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Status</th>
                                <th className="px-8 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-8 py-6"><div className="h-14 bg-gray-50 dark:bg-gray-800 rounded-3xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-black text-emerald-600 text-[13px] tracking-tight hover:underline cursor-pointer">
                                                {bill.invoiceId}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[13px] font-bold text-gray-400">
                                            {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-[13px] font-black text-gray-700 dark:text-white tracking-tight uppercase">{bill.patientDetails.name || 'Anonymous'}</p>
                                            <p className="text-[11px] font-bold text-gray-400">{bill.patientDetails.mobile || '-'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-4 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                                                {bill.paymentSummary.paymentMode || 'Cash'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-gray-800 dark:text-white text-[15px]">
                                            ₹{(bill.paymentSummary.grandTotal || 0).toFixed(2)}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${bill.paymentSummary.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {bill.paymentSummary.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button 
                                                    onClick={() => onPrintClick(bill)}
                                                    className="p-1 text-gray-300 hover:text-emerald-500 transition-all"
                                                >
                                                    <Eye className="w-5 h-5 stroke-[2.5px]" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(bill._id)}
                                                    className="p-1 text-gray-300 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5 stroke-[2.5px]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden Print Area */}
            <div className="hidden">
                <div ref={printRef}>
                    {selectedBill && <PharmacyBillPrint billData={selectedBill} />}
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;
