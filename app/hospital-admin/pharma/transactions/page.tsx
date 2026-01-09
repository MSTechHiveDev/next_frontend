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
    ArrowUpRight
} from 'lucide-react';
import { PharmacyBillingService } from '@/lib/integrations/services/pharmacyBilling.service';
import { PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';
import PharmacyBillPrint from '@/components/pharmacy/billing/PharmacyBillPrint';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

const TransactionsPage = () => {
    const [bills, setBills] = useState<PharmacyBill[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBills, setTotalBills] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All Methods');
    const [dateFilter, setDateFilter] = useState('');
    const [isExporting, setIsExporting] = useState(false);

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
            toast.error('Failed to load transaction audit logs');
        } finally {
            setLoading(false);
        }
    };

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
        if (!window.confirm('Warning: This will permanently delete the transaction record. Proceed?')) return;

        try {
            await PharmacyBillingService.deleteBill(id);
            toast.success('Record purged');
            fetchBills(currentPage);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Purge failed');
        }
    };

    const handleExportExcel = async () => {
        if (bills.length === 0) {
            toast.error('No transaction records to export');
            return;
        }

        setIsExporting(true);
        try {
            const exportData = await PharmacyBillingService.getBills(1, 2000, searchTerm, paymentFilter, dateFilter);
            const allBills = exportData.bills;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Transaction Audit');

            worksheet.mergeCells('A2:G2');
            const titleCell = worksheet.getCell('A2');
            titleCell.value = 'Pharmacy Transaction Logs';
            titleCell.font = { name: 'Arial Black', size: 18, bold: true, color: { argb: 'FF1F2937' } };
            titleCell.alignment = { horizontal: 'center' };

            worksheet.mergeCells('A3:G3');
            const subCell = worksheet.getCell('A3');
            subCell.value = 'Hospital Administrator Finance Audit Manifest';
            subCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF6B7280' } };
            subCell.alignment = { horizontal: 'center' };

            worksheet.getCell('A5').value = 'Audit Date:';
            worksheet.getCell('B5').value = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            worksheet.getCell('A5').font = { bold: true };

            if (dateFilter) {
                worksheet.getCell('D5').value = 'Temporal Sector:';
                worksheet.getCell('E5').value = dateFilter;
                worksheet.getCell('D5').font = { bold: true };
            }

            const columns = [
                { header: 'INVOICE_ID', key: 'id', width: 15 },
                { header: 'TIMESTAMP', key: 'date', width: 15 },
                { header: 'PATIENT_ENTITY', key: 'patient', width: 25 },
                { header: 'CONTACT', key: 'phone', width: 15 },
                { header: 'GATEWAY', key: 'mode', width: 12 },
                { header: 'QUANTUM (₹)', key: 'amount', width: 12 },
                { header: 'VALIDATION', key: 'status', width: 12 },
            ];

            const headerRow = worksheet.getRow(7);
            columns.forEach((col, idx) => {
                const cell = headerRow.getCell(idx + 1);
                cell.value = col.header;
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1F2937' }
                };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    bottom: { style: 'medium', color: { argb: 'FF3B82F6' } }
                };
            });

            allBills.forEach((bill, index) => {
                const rIdx = 8 + index;
                const row = worksheet.getRow(rIdx);

                row.values = [
                    bill.invoiceId,
                    new Date(bill.createdAt).toLocaleDateString('en-GB'),
                    bill.patientName || 'ANONYMOUS',
                    bill.customerPhone,
                    bill.paymentSummary.paymentMode,
                    bill.paymentSummary.grandTotal,
                    bill.paymentSummary.status
                ];

                row.eachCell((cell, colIdx) => {
                    cell.font = { size: 11 };
                    cell.alignment = { vertical: 'middle', horizontal: colIdx === 6 ? 'right' : 'center' };

                    if (index % 2 !== 0) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF9FAFB' }
                        };
                    }

                    cell.border = {
                        bottom: { style: 'thin', color: { argb: 'FFF3F4F6' } }
                    };

                    if (colIdx === 7) {
                        const status = cell.value as string;
                        cell.font = {
                            bold: true,
                            color: { argb: status === 'Paid' ? 'FF059669' : 'FFDC2626' }
                        };
                    }
                });
            });

            const totalQuantum = allBills.reduce((acc, b) => acc + (b.paymentSummary.grandTotal || 0), 0);
            const summaryRowIdx = 8 + allBills.length + 1;
            worksheet.getCell(`E${summaryRowIdx}`).value = 'AGGREGATE:';
            worksheet.getCell(`F${summaryRowIdx}`).value = totalQuantum;
            worksheet.getCell(`E${summaryRowIdx}`).font = { bold: true };
            worksheet.getCell(`F${summaryRowIdx}`).font = { bold: true, size: 12, color: { argb: 'FF2563EB' } };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Hospital_Pharma_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Audit Log exported successfully');
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Manifest extraction failed');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Transaction Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Sales Audit & Revenue Tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm dark:bg-indigo-950/20 dark:border-indigo-900/30 disabled:opacity-50"
                    >
                        <Download size={16} />
                        {isExporting ? 'Exporting...' : 'Export Audit'}
                    </button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl pl-11 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                            placeholder="Search by Invoice ID nomenclature..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Gateway Filter</p>
                        <select
                            className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none ring-1 ring-gray-100 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                            value={paymentFilter}
                            onChange={e => setPaymentFilter(e.target.value)}
                        >
                            <option>All Methods</option>
                            <option>Cash</option>
                            <option>Card</option>
                            <option>UPI</option>
                            <option>Mixed</option>
                            <option>Credit</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Temporal Filter</p>
                        <input
                            type="date"
                            className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none ring-1 ring-gray-100 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            </div>

            {/* Active Logs Container */}
            <div className="bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm relative">
                {/* Custom Pagination Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-black/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <ArrowUpRight size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dataset Magnitude</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{totalBills} Operations</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                            UNIT {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reference</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity Account</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantum</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Validation</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-8 py-6"><div className="h-14 bg-gray-50 dark:bg-gray-700 rounded-3xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-black text-blue-600 text-[12px] tracking-tight hover:underline cursor-pointer uppercase">
                                                #{bill.invoiceId}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[12px] font-bold text-gray-400 uppercase">
                                            {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-[12px] font-black text-gray-700 dark:text-white tracking-tight uppercase">{bill.patientName || 'ANONYMOUS ENTITY'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 tracking-widest">{bill.customerPhone || '-'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest">
                                                {bill.paymentSummary.paymentMode || 'CASH'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-gray-900 dark:text-white text-[14px]">
                                            ₹{(bill.paymentSummary.grandTotal || 0).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${bill.paymentSummary.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {bill.paymentSummary.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => onPrintClick(bill)}
                                                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bill._id)}
                                                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {bills.length === 0 && !loading && (
                    <div className="p-20 text-center">
                        <p className="text-xl font-black text-gray-300 uppercase tracking-tighter italic">Log Void</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">No transaction records found in current temporal sector.</p>
                    </div>
                )}
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
