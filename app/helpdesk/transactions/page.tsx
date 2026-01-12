'use client';

import React, { useState, useEffect } from "react";
import { 
    CreditCard, 
    Download, 
    Search, 
    TrendingUp, 
    Filter, 
    Loader2, 
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    FileText,
    ChevronRight,
    Activity,
    Shield
} from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const limit = 10;

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await helpdeskService.getTransactions(page, limit);
            if (data.data) {
                setTransactions(data.data);
                setTotal(data.pagination?.total || 0);
            } else if (Array.isArray(data)) {
                setTransactions(data);
                setTotal(data.length);
            }
        } catch (error: any) {
            toast.error("Financial Sync Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (range: "daily" | "weekly" | "monthly" | "all") => {
        try {
            setExporting(true);
            setShowExportMenu(false);
            
            // Fetch ALL transactions for the selected range (nopage=true)
            const data = await helpdeskService.getTransactions(1, 1000, range === "all" ? undefined : range, true);
            const exportData = Array.isArray(data) ? data : (data.data || []);

            if (exportData.length === 0) {
                toast.error("No data found for the selected period");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Transactions");

            // Define Headers
            worksheet.columns = [
                { header: "DATE", key: "date", width: 20 },
                { header: "PATIENT NAME", key: "patient", width: 25 },
                { header: "MOBILE", key: "mobile", width: 15 },
                { header: "SERVICE TYPE", key: "type", width: 20 },
                { header: "AMOUNT (INR)", key: "amount", width: 15 },
                { header: "PAYMENT MODE", key: "mode", width: 15 },
                { header: "STATUS", key: "status", width: 15 }
            ];

            // Style Headers
            worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
            worksheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "0F172A" }
            };

            // Add Data
            exportData.forEach((tx: any) => {
                worksheet.addRow({
                    date: new Date(tx.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    patient: tx.patientName.toUpperCase(),
                    mobile: tx.patientMobile || "N/A",
                    type: (tx.type || "OPD Consultation").toUpperCase(),
                    amount: tx.amount,
                    mode: (tx.paymentMethod || "CASH").toUpperCase(),
                    status: tx.status.toUpperCase()
                });
            });

            // Summary Row
            const totalAmount = exportData.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
            worksheet.addRow({});
            const summaryRow = worksheet.addRow({ mode: "TOTAL REVENUE", amount: totalAmount });
            summaryRow.font = { bold: true };

            // Generate File
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `CureChain_Revenue_${range.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            toast.success(`${range.toUpperCase()} manifest exported successfully`);
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Export Failed");
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, [page]);

    // Re-fetch on search if needed or filter client-side for immediate feedback
    // Realistically with server pagination, search should also be server-side
    // But for now, we'll keep it simple or implement server search if endpoint supports it
    const filteredTransactions = transactions.filter(tx => {
        const name = tx.patient?.name || tx.patientName || "Unknown";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(total / limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Revenue Ledger...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* PROFESSIONAL HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 max-w-7xl mx-auto">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                        <Link href="/helpdesk" className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-teal-600 transition-all">
                            <ArrowLeft size={16} />
                        </Link>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Cycle / Financial Ledger</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Physician Billing Control
                    </h1>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Hospital Node / Asset Transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exporting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={14} />} 
                            Export Manifest
                        </button>
                        
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                                <button onClick={() => handleExport("daily")} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-teal-600 transition-colors">Daily Report</button>
                                <button onClick={() => handleExport("weekly")} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-teal-600 transition-colors">Weekly Manifest</button>
                                <button onClick={() => handleExport("monthly")} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-teal-600 transition-colors">Monthly Ledger</button>
                                <div className="border-t border-slate-50 my-1"></div>
                                <button onClick={() => handleExport("all")} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-teal-600 transition-colors">Export All Objects</button>
                            </div>
                        )}
                    </div>
                    <button onClick={fetchTransactions} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 transition-all shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* TRANSACTION MANIFEST */}
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* SEARCH & FILTER BAR */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="FILTER PATIENTS..."
                            className="w-full pl-11 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-tight outline-none focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 px-6 border-l border-slate-100 hidden md:flex">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ledger Size</span>
                            <span className="text-xs font-bold text-teal-600 uppercase tracking-tight">{filteredTransactions.length} ENTRIES</span>
                         </div>
                    </div>
                </div>

                {/* LEDGER TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="overflow-x-auto">
                        {filteredTransactions.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <th className="px-6 py-4">Reference Node</th>
                                        <th className="px-6 py-4">Clinical Service</th>
                                        <th className="px-6 py-4 text-center">Amount (INR)</th>
                                        <th className="px-6 py-4 text-center">Sync State</th>
                                        <th className="px-6 py-4 text-right">Payment Mode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTransactions.map((tx, index) => {
                                        const amount = tx.payment?.amount || tx.amount || 0;
                                        const status = tx.payment?.status || tx.status || "Completed";
                                        const type = (tx.type || "OPD Consultation").toUpperCase();
                                        const patientName = (tx.patient?.name || "Emergency Patient").toUpperCase();

                                        return (
                                            <tr key={tx._id || index} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                   <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center font-bold text-lg shadow-sm border border-slate-100 shrink-0">
                                                            {patientName.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{patientName}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">#{tx._id?.slice(-8) || "REF-ID"}</p>
                                                        </div>
                                                   </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{type}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                     <p className="text-xs font-bold text-slate-900 tracking-tight">₹{amount.toLocaleString()}.00</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                     <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest ${
                                                        status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed'
                                                            ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                                                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                     }`}>
                                                        <span className={`w-1 h-1 rounded-full ${status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed' ? 'bg-teal-500' : 'bg-rose-500'}`} />
                                                        {status}
                                                     </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200">
                                                        <CreditCard size={12} className="text-slate-400" />
                                                        {tx.paymentMethod || 'CASH'}
                                                     </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-20 text-center">
                                <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No financial objects indexed</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGINATION PANEL */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 max-w-fit mx-auto shadow-sm">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 text-slate-400 hover:text-teal-600 disabled:opacity-30 transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                        page === i + 1 
                                            ? 'bg-slate-900 text-white shadow-lg' 
                                            : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 text-slate-400 hover:text-teal-600 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
