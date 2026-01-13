"use client";

import React, { useEffect, useState } from 'react';
import { LabBillingService } from '@/lib/integrations/services/labBilling.service';
import { BillResponse } from '@/lib/integrations/types/labBilling';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

export default function TransactionsPage() {
    const [bills, setBills] = useState<BillResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchBills = async (pageNum = 1) => {
        setLoading(true);
        try {
            // Explicitly requesting 10 items per page
            const data = await LabBillingService.getBills(pageNum, 10, false, startDate, endDate);
            setBills(data.bills);
            setTotalPages(data.totalPages);
            setPage(data.currentPage);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills(1); // Reset to page 1 on date filter change
    }, [startDate, endDate]);

    useEffect(() => {
        fetchBills(page);
    }, [page]);

    const handleExport = async () => {
        setExporting(true);
        try {
            // Fetch all transactions with current filters
            const res = await LabBillingService.getBills(1, 2000, true, startDate, endDate);
            const allBills = res.bills;

            if (allBills.length === 0) {
                alert("No transactions to export");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Transactions');

            // 1. Title & Center Name
            worksheet.mergeCells('B2:H2');
            const titleCell = worksheet.getCell('B2');
            titleCell.value = 'Transaction Report';
            titleCell.font = { name: 'Arial Black', size: 16, bold: true };
            titleCell.alignment = { horizontal: 'center' };

            worksheet.mergeCells('B3:H3');
            const subtitleCell = worksheet.getCell('B3');
            subtitleCell.value = 'Medilab Diagnostic Center';
            subtitleCell.font = { name: 'Arial', size: 12, bold: true };
            subtitleCell.alignment = { horizontal: 'center' };

            // 2. Date Range
            // 2. Date Range
            let fromDateCheck = 'All Time';
            let toDateCheck = 'Present';

            if (startDate) {
                fromDateCheck = new Date(startDate).toLocaleDateString('en-GB');
            } else if (allBills.length > 0) {
                const dates = allBills.map(b => new Date(b.createdAt));
                fromDateCheck = new Date(Math.min(...dates.map(d => d.getTime()))).toLocaleDateString('en-GB');
            }

            if (endDate) {
                toDateCheck = new Date(endDate).toLocaleDateString('en-GB');
            } else if (allBills.length > 0 && !startDate) {
                const dates = allBills.map(b => new Date(b.createdAt));
                toDateCheck = new Date(Math.max(...dates.map(d => d.getTime()))).toLocaleDateString('en-GB');
            }

            worksheet.getCell('A4').value = 'Report From:';
            worksheet.getCell('B4').value = fromDateCheck;
            worksheet.getCell('A5').value = 'Report To:';
            worksheet.getCell('B5').value = toDateCheck;
            [worksheet.getCell('A4'), worksheet.getCell('A5')].forEach(c => c.font = { bold: true });

            // 3. Header Row
            const headerRow = worksheet.getRow(7);
            const headers = ['Invoice ID', 'Patient', 'Mobile', 'Amount', 'Paid', 'Balance', 'Status', 'Date'];
            headerRow.values = headers;

            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF166534' } // Dark Green (emerald-800 approx)
                };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center' };
            });

            // 4. Data Rows
            allBills.forEach((bill, index) => {
                const row = worksheet.addRow([
                    bill.invoiceId,
                    bill.patientDetails.name,
                    bill.patientDetails.mobile,
                    bill.finalAmount,
                    bill.paidAmount,
                    bill.balance,
                    bill.status,
                    new Date(bill.createdAt).toLocaleDateString()
                ]);

                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // 5. Totals
            const totalAmount = allBills.reduce((sum, b) => sum + b.finalAmount, 0);
            const totalPaid = allBills.reduce((sum, b) => sum + b.paidAmount, 0);

            const totalAmountRow = worksheet.addRow([]);
            worksheet.getCell(`C${totalAmountRow.number}`).value = 'Total Amount:';
            worksheet.getCell(`D${totalAmountRow.number}`).value = totalAmount;

            const totalPaidRow = worksheet.addRow([]);
            worksheet.getCell(`C${totalPaidRow.number}`).value = 'Total Paid:';
            worksheet.getCell(`D${totalPaidRow.number}`).value = totalPaid;

            [worksheet.getCell(`C${totalAmountRow.number}`), worksheet.getCell(`C${totalPaidRow.number}`)].forEach(c => {
                c.font = { bold: true };
                c.alignment = { horizontal: 'right' };
            });
            [worksheet.getCell(`D${totalAmountRow.number}`), worksheet.getCell(`D${totalPaidRow.number}`)].forEach(c => {
                c.font = { bold: true };
            });

            // Set column widths
            for (let i = 1; i <= 8; i++) {
                worksheet.getColumn(i).width = i === 2 ? 25 : 15;
            }

            // Generate and save
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `Transactions_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export transactions");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Download className="w-5 h-5 text-white" />
                        </div>
                        Lab Transactions
                    </h1>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
                        Billing History & <span className="text-indigo-600">Payment Records</span>
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                >
                    {exporting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {exporting ? 'Exporting...' : 'Export Excel'}
                </button>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap gap-6 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest text-center md:text-left">Filter by Date</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <div className="text-gray-300 font-bold">→</div>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                    { (startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-950/20 px-4 py-2 rounded-lg transition-all pt-7 md:pt-4"
                        >
                            Reset
                        </button>
                    )}
                </div>
                
                <div className="md:col-span-4 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[32px] border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Items per Page</span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">10 ITEMS</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Transaction Count</span>
                        <div className="flex gap-1.5">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i+1 === page ? 'bg-indigo-600' : 'bg-indigo-200 dark:bg-indigo-800'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice ID</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid Amount</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Payment Mode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                             <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Transactions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20 grayscale">
                                             <Download className="w-12 h-12 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Transactions Found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg w-fit mb-1 border border-indigo-100 dark:border-indigo-800">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs tracking-tight">{bill.invoiceId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(bill.createdAt).toLocaleDateString()}</span>
                                            <div className="text-[9px] text-gray-300 font-medium">@ {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{bill.patientDetails.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">{bill.patientDetails.mobile}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">₹{bill.finalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{bill.paidAmount.toLocaleString()}</span>
                                            {bill.balance > 0 && <div className="text-[9px] text-rose-400 font-bold">Due: ₹{bill.balance}</div>}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                                bill.status === 'Paid' 
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' 
                                                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-gray-600">
                                                {bill.paymentMode}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page <span className="text-indigo-600">{page}</span> / {totalPages}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-all disabled:opacity-30 disabled:hover:border-gray-200"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:border-indigo-400 transition-all disabled:opacity-30 disabled:hover:border-gray-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
