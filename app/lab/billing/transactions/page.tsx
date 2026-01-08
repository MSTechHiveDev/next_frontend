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

    const fetchBills = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await LabBillingService.getBills(pageNum);
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
        fetchBills(page);
    }, [page]);

    const handleExport = async () => {
        setExporting(true);
        try {
            // Fetch all transactions
            const res = await LabBillingService.getBills(1, 1000, true);
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
            const dates = allBills.map(b => new Date(b.createdAt));
            const fromDate = new Date(Math.min(...dates.map(d => d.getTime()))).toLocaleDateString();
            const toDate = new Date(Math.max(...dates.map(d => d.getTime()))).toLocaleDateString();

            worksheet.getCell('A4').value = 'From Date:';
            worksheet.getCell('B4').value = fromDate;
            worksheet.getCell('A5').value = 'To Date:';
            worksheet.getCell('B5').value = toDate;
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
            worksheet.columns.forEach((col, i) => {
                col.width = i === 1 ? 25 : 15;
            });

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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all laboratory billings</p>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
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
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading transactions...</td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No transactions found</td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{bill.invoiceId}</td>
                                        <td className="px-6 py-4">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-semibold">{bill.patientDetails.name}</td>
                                        <td className="px-6 py-4">{bill.patientDetails.mobile}</td>
                                        <td className="px-6 py-4 font-bold">₹{bill.finalAmount}</td>
                                        <td className="px-6 py-4 text-green-600 font-bold">₹{bill.paidAmount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                bill.status === 'Due' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
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
                <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-white transition-all disabled:opacity-50 shadow-sm active:scale-95"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-white transition-all disabled:opacity-50 shadow-sm active:scale-95"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
