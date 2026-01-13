'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Printer,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Download,
    Hash,
    Calendar,
    RefreshCcw,
    FileText
} from 'lucide-react';
import { PharmacyBillingService } from '@/lib/integrations/services/pharmacyBilling.service';
import { PharmacyBill } from '@/lib/integrations/types/pharmacyBilling';
import PharmacyBillPrint, { ShopDetails } from '@/components/pharmacy/billing/PharmacyBillPrint';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useAuthStore } from '@/stores/authStore';

const TransactionsPage = () => {
    const { user } = useAuthStore();
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
    const [billToPrint, setBillToPrint] = useState<PharmacyBill | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const shopDetails: ShopDetails = {
        name: (user as any)?.shopName || user?.name || 'Pharmacy Store',
        address: (user as any)?.address || 'No Address Provided',
        phone: (user as any)?.mobile || (user as any)?.phone || '-',
        email: (user as any)?.email || '-',
        gstin: (user as any)?.gstin || '-',
        dlNo: (user as any)?.licenseNo,
        logo: (user as any)?.image || (user as any)?.logo
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: billToPrint ? `Invoice_${billToPrint.invoiceId}` : 'Invoice',
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
            toast.error('Failed to load transaction records');
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
        setBillToPrint(bill);
        setTimeout(() => {
            handlePrint();
        }, 500);
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
            // Fetch more records for export (limit 2000)
            const exportData = await PharmacyBillingService.getBills(1, 2000, searchTerm, paymentFilter, dateFilter);
            const allBills = exportData.bills;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Transaction Audit');

            // Header Branding
            worksheet.mergeCells('A2:G2');
            const titleCell = worksheet.getCell('A2');
            titleCell.value = 'Pharmacy Transaction Logs';
            titleCell.font = { name: 'Arial Black', size: 18, bold: true, color: { argb: 'FF1F2937' } };
            titleCell.alignment = { horizontal: 'center' };

            worksheet.mergeCells('A3:G3');
            const subCell = worksheet.getCell('A3');
            subCell.value = 'Sales Audit & Revenue Tracking Manifest';
            subCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF6B7280' } };
            subCell.alignment = { horizontal: 'center' };

            worksheet.getCell('A5').value = 'Export Date:';
            worksheet.getCell('B5').value = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            worksheet.getCell('A5').font = { bold: true };

            if (dateFilter) {
                worksheet.getCell('D5').value = 'Temporal Sector:';
                worksheet.getCell('E5').value = dateFilter;
                worksheet.getCell('D5').font = { bold: true };
            }

            // Columns Definition
            const columns = [
                { header: 'INVOICE_ID', key: 'id', width: 15 },
                { header: 'DATE', key: 'date', width: 15 },
                { header: 'PATIENT', key: 'patient', width: 25 },
                { header: 'CONTACT', key: 'phone', width: 15 },
                { header: 'PAYMENT', key: 'mode', width: 12 },
                { header: 'AMOUNT (₹)', key: 'amount', width: 12 },
                { header: 'STATUS', key: 'status', width: 12 },
            ];

            // Header Row Styling
            const headerRow = worksheet.getRow(7);
            columns.forEach((col, idx) => {
                const cell = headerRow.getCell(idx + 1);
                cell.value = col.header;
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1F2937' } // Gray 800
                };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    bottom: { style: 'medium', color: { argb: 'FF10B981' } } // Emerald 500
                };
            });

            // Data Ingestion
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

                // Formatting Cells
                row.eachCell((cell, colIdx) => {
                    cell.font = { size: 11 };
                    cell.alignment = { vertical: 'middle', horizontal: colIdx === 6 ? 'right' : 'center' };

                    // Row Striping
                    if (index % 2 !== 0) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF9FAFB' }
                        };
                    }

                    // Border Protocol
                    cell.border = {
                        bottom: { style: 'thin', color: { argb: 'FFF3F4F6' } }
                    };

                    // Status Highlight
                    if (colIdx === 7) {
                        const status = cell.value as string;
                        cell.font = {
                            bold: true,
                            color: { argb: status === 'Paid' ? 'FF059669' : 'FFDC2626' }
                        };
                    }
                });
            });

            // Footer / Metrics
            const totalQuantum = allBills.reduce((acc, b) => acc + (b.paymentSummary.grandTotal || 0), 0);
            const summaryRowIdx = 8 + allBills.length + 1;
            worksheet.getCell(`E${summaryRowIdx}`).value = 'TOTAL REVENUE:';
            worksheet.getCell(`F${summaryRowIdx}`).value = totalQuantum;
            worksheet.getCell(`E${summaryRowIdx}`).font = { bold: true };
            worksheet.getCell(`F${summaryRowIdx}`).font = { bold: true, size: 12, color: { argb: 'FF059669' } }; // Emerald 600

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Pharmacy_Sales_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Sales ledger exported');
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-gray-900 dark:text-white w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Sales History</h1>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">View and manage your pharmacy sales</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900/30 disabled:opacity-50"
                    >
                        <Download size={16} />
                        {isExporting ? 'Exporting...' : 'Export Ledger'}
                    </button>
                </div>
            </div>

            {/* Controller Area */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl md:rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row w-full gap-4 items-center">

                    {/* Date Filter */}
                    <div className="relative w-full md:w-auto min-w-[160px]">
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                        />
                    </div>

                    {/* Payment Filter */}
                    <div className="relative w-full md:w-auto min-w-[160px]">
                        <select
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none ring-1 ring-gray-100 dark:ring-gray-700 focus:ring-2 focus:ring-emerald-500 dark:text-white cursor-pointer appearance-none"
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
                        <ChevronLeft className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
                    </div>

                    <div className="h-10 w-px bg-gray-100 dark:bg-gray-700 hidden md:block" />

                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by ID, patient name, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchBills(1)}
                        className="p-3 w-full md:w-auto flex justify-center bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-xl hover:text-emerald-500 transition-all border border-gray-100 dark:border-gray-700"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="w-full max-w-full bg-white dark:bg-gray-800 rounded-3xl md:rounded-4xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 md:px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                                <th className="px-6 md:px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 md:px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 md:px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                                <th className="px-6 md:px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 md:px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 md:px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest md:w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center text-gray-400 text-xs font-bold animate-pulse">
                                        Retrieving financial records...
                                    </td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <FileText className="w-12 h-12 opacity-10" />
                                            <p className="text-xs font-black uppercase tracking-widest">No Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill._id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 md:px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                                                    <Hash size={14} />
                                                </div>
                                                <span className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight">{bill.invoiceId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-5">
                                            <span className="font-bold text-xs text-gray-500 uppercase">{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : '-'}</span>
                                            <span className="block text-[10px] font-black text-gray-400">{bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString() : ''}</span>
                                        </td>
                                        <td className="px-6 md:px-8 py-5">
                                            <div>
                                                <p className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight">{bill.patientName || 'Walk-in'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{bill.customerPhone || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-5">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-black text-gray-500 uppercase">
                                                {bill.items?.length || 0} SKUs
                                            </span>
                                        </td>
                                        <td className="px-6 md:px-8 py-5 text-right">
                                            <p className="font-black text-sm text-gray-900 dark:text-white">₹{Math.round(bill.paymentSummary?.grandTotal || 0).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{bill.paymentSummary?.paymentMode || 'CASH'}</p>
                                        </td>
                                        <td className="px-6 md:px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${bill.paymentSummary?.status === 'Paid'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30'
                                                : 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${bill.paymentSummary?.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {bill.paymentSummary?.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 md:px-8 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedBill(bill)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                                                    title="View Invoice"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bill._id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onPrintClick(bill)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            {/* Pagination Controls */}
            {!loading && bills.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 md:p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 order-2 sm:order-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Next
                        </button>
                    </div>
                    <div className="flex items-center gap-3 order-1 sm:order-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Page <span className="text-emerald-600">{currentPage}</span> of {totalPages}
                        </span>
                    </div>
                </div>
            )}
        </div>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    {billToPrint && (
                        <PharmacyBillPrint
                            billData={billToPrint}
                            shopDetails={shopDetails || {
                                name: 'Pharmacy Store',
                                address: 'Main Road',
                                mobileNumber: '',
                                dlNumber: '',
                                gstNumber: ''
                            }}
                        />
                    )}
                </div>
            </div>

            {/* View Modal */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto relative">
                        <div className="sticky top-0 bg-white border-b z-10 p-4 flex justify-between items-center text-black">
                            <h3 className="font-black uppercase tracking-wider text-sm">Invoice Details</h3>
                            <button
                                onClick={() => setSelectedBill(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-black"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-4 md:p-8 flex justify-center bg-gray-50 overflow-x-auto">
                            <div className="min-w-[600px] bg-white shadow-lg">
                                {/* Use PharmacyBillPrint for standardized viewing */}
                                <PharmacyBillPrint
                                    billData={selectedBill}
                                    shopDetails={shopDetails || {
                                        name: 'Pharmacy Store',
                                        address: 'Main Road',
                                        mobileNumber: '',
                                        dlNumber: '',
                                        gstNumber: ''
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;
