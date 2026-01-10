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

    const fetchBills = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await LabBillingService.getBills(pageNum, 10, false, startDate, endDate);
            setBills(res.bills);
            setTotalPages(res.totalPages);
            setPage(res.currentPage);
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
        <div className="p-6 transition-colors duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Transactions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all laboratory billings</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Exporting...' : 'Export Excel'}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-wrap gap-4 items-end transition-colors">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-400"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-400"
                    />
                </div>
                <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                    Clear Filters
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Invoice ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">Mobile</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Paid</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Mode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading transactions...</td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No transactions found</td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{bill.invoiceId}</td>
                                        <td className="px-6 py-4">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{bill.patientDetails.name}</td>
                                        <td className="px-6 py-4">{bill.patientDetails.mobile}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{bill.finalAmount}</td>
                                        <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">₹{bill.paidAmount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bill.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                bill.status === 'Due' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bill.paymentMode}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900 transition-colors">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50 shadow-sm active:scale-95"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50 shadow-sm active:scale-95"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div >
    );
}
