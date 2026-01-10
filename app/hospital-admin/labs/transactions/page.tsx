'use client';

import React, { useEffect, useState } from 'react';
import { LabBillingService } from '@/lib/integrations/services/labBilling.service';
import { BillResponse } from '@/lib/integrations/types/labBilling';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
    Download,
    Search,
    Calendar,
    Filter,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Activity,
    FlaskConical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HospitalAdminLabTransactionsPage() {
    const [bills, setBills] = useState<BillResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchBills = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await LabBillingService.getBills(pageNum, 10, false, startDate, endDate);
            setBills(res.bills);
            setTotalPages(res.totalPages);
            setPage(res.currentPage);
        } catch (error) {
            console.error("Audit fetch failed", error);
            toast.error("Failed to synchronize transaction logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills(1);
    }, [startDate, endDate]);

    useEffect(() => {
        fetchBills(page);
    }, [page]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await LabBillingService.getBills(1, 2000, true, startDate, endDate);
            const allBills = res.bills;

            if (allBills.length === 0) {
                toast.error("No transaction records found for export");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Lab Audit Manifest');

            // Header Branding
            worksheet.mergeCells('A2:H2');
            const titleCell = worksheet.getCell('A2');
            titleCell.value = 'Laboratory Transaction Logs';
            titleCell.font = { name: 'Arial Black', size: 18, bold: true, color: { argb: 'FF1F2937' } };
            titleCell.alignment = { horizontal: 'center' };

            worksheet.mergeCells('A3:H3');
            const subCell = worksheet.getCell('A3');
            subCell.value = 'Hospital Administrator Finance Audit Manifest';
            subCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF6B7280' } };
            subCell.alignment = { horizontal: 'center' };

            // Dates
            worksheet.getCell('A5').value = 'Report Period Start:';
            worksheet.getCell('B5').value = startDate ? new Date(startDate).toLocaleDateString('en-GB') : 'ALL_TIME_START';
            worksheet.getCell('A5').font = { bold: true };

            worksheet.getCell('A6').value = 'Report Period End:';
            worksheet.getCell('B6').value = endDate ? new Date(endDate).toLocaleDateString('en-GB') : 'CURRENT';
            worksheet.getCell('A6').font = { bold: true };

            // Column Alignment Mapping
            const columns = [
                { header: 'INVOICE_ID', key: 'id', width: 15 },
                { header: 'TIMESTAMP', key: 'date', width: 15 },
                { header: 'PATIENT_ENTITY', key: 'patient', width: 25 },
                { header: 'CONTACT', key: 'phone', width: 15 },
                { header: 'QUANTUM (₹)', key: 'amount', width: 15 },
                { header: 'PAID (₹)', key: 'paid', width: 15 },
                { header: 'VALIDATION', key: 'status', width: 15 },
                { header: 'GATEWAY', key: 'mode', width: 15 },
            ];

            const headerRow = worksheet.getRow(8);
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
                cell.border = { bottom: { style: 'medium', color: { argb: 'FF3B82F6' } } };
                worksheet.getColumn(idx + 1).width = col.width;
            });

            allBills.forEach((bill, index) => {
                const rIdx = 9 + index;
                const row = worksheet.getRow(rIdx);
                row.values = [
                    bill.invoiceId,
                    new Date(bill.createdAt).toLocaleDateString('en-GB'),
                    bill.patientDetails.name,
                    bill.patientDetails.mobile,
                    bill.finalAmount,
                    bill.paidAmount,
                    bill.status,
                    bill.paymentMode
                ];

                row.eachCell((cell, colIdx) => {
                    cell.font = { size: 11 };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    if (index % 2 !== 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }
                    cell.border = { bottom: { style: 'thin', color: { argb: 'FFF3F4F6' } } };

                    if (colIdx === 7) {
                        const s = cell.value as string;
                        cell.font = { bold: true, color: { argb: s === 'Paid' ? 'FF059669' : 'FFDC2626' } };
                    }
                });
            });

            // Calculate Totals
            const totalAmount = allBills.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
            const totalPaid = allBills.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
            const lastRowIdx = 9 + allBills.length;

            // Margin
            const marginRow = worksheet.getRow(lastRowIdx + 1);
            marginRow.height = 10;

            // Total Amount Row
            const totalRow = worksheet.getRow(lastRowIdx + 2);
            totalRow.getCell(4).value = 'TOTAL REVENUE:';
            totalRow.getCell(4).font = { bold: true, color: { argb: 'FF1F2937' } };
            totalRow.getCell(4).alignment = { horizontal: 'right' };

            totalRow.getCell(5).value = totalAmount;
            totalRow.getCell(5).numFmt = '₹#,##0.00';
            totalRow.getCell(5).font = { bold: true, size: 12, color: { argb: 'FF1F2937' } };

            // Total Paid Row
            const paidRow = worksheet.getRow(lastRowIdx + 3);
            paidRow.getCell(4).value = 'TOTAL RECEIVED:';
            paidRow.getCell(4).font = { bold: true, color: { argb: 'FF059669' } };
            paidRow.getCell(4).alignment = { horizontal: 'right' };

            paidRow.getCell(6).value = totalPaid;
            paidRow.getCell(6).numFmt = '₹#,##0.00';
            paidRow.getCell(6).font = { bold: true, size: 12, color: { argb: 'FF059669' } };

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `Lab_Audit_Manifest_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Audit manifest exported successfully");
        } catch (error) {
            console.error("Export failure", error);
            toast.error("Manifest extraction failed");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Tier */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic uppercase">Transaction Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px] ml-1 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-blue-500" />
                        Strategic Audit & Revenue Integrity Monitoring
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className="flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Extracting manifest...' : 'Export Audit'}
                </button>
            </div>

            {/* Strategic Filters Hub */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap gap-8 items-end relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Temporal Start</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Temporal End</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                >
                    Clear Filter Hub
                </button>
            </div>

            {/* Audit manifestation Terminal */}
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reference</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity Account</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantum</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Validation</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <FlaskConical className="w-12 h-12 text-gray-300" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Zero Operations Found In Current Sector</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black italic bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl uppercase">#{bill.invoiceId}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                                                {new Date(bill.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter underline underline-offset-4 decoration-gray-100 dark:decoration-gray-800">{bill.patientDetails.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{bill.patientDetails.mobile}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-gray-900 dark:text-white">₹{bill.finalAmount.toLocaleString()}</span>
                                                {bill.paidAmount < bill.finalAmount && <span className="text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">Arrears: ₹{(bill.finalAmount - bill.paidAmount).toLocaleString()}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${bill.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3 h-3 text-gray-300" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{bill.paymentMode}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tactical Pagination Terminal */}
                <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-gray-400 hover:text-blue-500 uppercase tracking-widest transition-all disabled:opacity-20"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Sector Backward
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Unit {page} of {totalPages}</span>
                        <div className="flex gap-1 mt-2">
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                <div key={i} className={`w-4 h-1 rounded-full ${i + 1 === page ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            ))}
                        </div>
                    </div>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-gray-400 hover:text-blue-500 uppercase tracking-widest transition-all disabled:opacity-20"
                    >
                        Sector Forward
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
