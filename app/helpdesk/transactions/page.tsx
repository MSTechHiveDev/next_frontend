'use client';

import React from "react";
import { CreditCard, Download, Search, TrendingUp, Filter } from "lucide-react";
import { helpdeskData } from "@/lib/integrations/data/helpdesk";

export default function TransactionsPage() {
    const { transactions } = helpdeskData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Transactions</h1>
                    <p className="text-gray-500">Monitor and process hospital payments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-50 transition-all">
                        <Download size={18} /> Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                        <TrendingUp size={18} /> New Bill
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
                            placeholder="Find transactions..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm outline-none"
                        />
                    </div>
                    <button className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{tx.patientName}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">#{tx.id} • {new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tx.type}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">₹{tx.amount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                            tx.status === 'Paid' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Receipt</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
