'use client';

import React, { useState, useEffect } from "react";
import { CreditCard, Download, Search, TrendingUp, Filter, Loader2, AlertCircle } from "lucide-react";
import { helpdeskService } from "@/lib/integrations";
import toast from "react-hot-toast";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await helpdeskService.getTransactions();
            setTransactions(data);
        } catch (error: any) {
            console.error("Failed to fetch transactions:", error);
            toast.error(error.message || "Failed to load financial records");
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const patientName = tx.patient?.name || "Unknown";
        return patientName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Retrieving Financial Logs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter italic">Financial Transactions</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Audit and verify hospital payment cycles</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111] text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 transition-all">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        <TrendingUp size={18} /> Process Bill
                    </button>
                </div>
            </div>

            {/* Transaction Grid */}
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="FIND TRANSACTIONS BY PATIENT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-blue-500 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {filteredTransactions.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 italic">Entity Details</th>
                                    <th className="px-6 py-4 italic">Type</th>
                                    <th className="px-6 py-4 italic">Amount</th>
                                    <th className="px-6 py-4 italic">Status</th>
                                    <th className="px-6 py-4 text-right italic">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredTransactions.map((tx, index) => {
                                    const amount = tx.payment?.amount || tx.amount || 0;
                                    const status = tx.payment?.status || tx.status || "Completed";
                                    const type = tx.type || "OPD Consultation";
                                    const patientName = tx.patient?.name || "Emergency Patient";
                                    const date = tx.appointmentTime || tx.date || tx.createdAt;

                                    return (
                                        <tr key={tx._id || `transaction-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 transition-transform group-hover:rotate-12">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{patientName}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">#{tx._id?.slice(-6) || "N/A"} • {new Date(date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{type}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter uppercase">₹{amount.toLocaleString()}.00</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    status === 'Paid' || status === 'Completed' || status === 'completed'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Print Receipt</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-600">
                                <AlertCircle className="text-gray-200 w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-black text-gray-300 italic tracking-tight uppercase leading-none">Logbook Empty</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">No active transactions found for the current filter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

