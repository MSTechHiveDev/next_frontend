"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { hospitalAdminService } from "@/lib/integrations/services/hospitalAdmin.service";
import { 
  Search, 
  Filter, 
  CreditCard,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
  Download,
  Calendar
} from "lucide-react";

export default function HospitalAdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await hospitalAdminService.getTransactions();
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      toast.error(error.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Financial Transactions</h1>
           <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Ledger: {transactions.length} Records</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
              System Integrity: Verified
           </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "emerald" },
           { label: "Transaction Volume", value: transactions.length, icon: TrendingUp, color: "blue" },
           { label: "Average Value", value: `$${transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : 0}`, icon: CreditCard, color: "purple" }
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
              <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl flex items-center justify-center text-${stat.color}-600`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
           </div>
         ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
             <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Search by patient or method..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
             />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
             <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                <Filter className="w-4 h-4" /> Filter
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                <Download className="w-4 h-4" /> Export
             </button>
          </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Identity</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-100 dark:shadow-none">
                        {tx.patientName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{tx.patientName}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 capitalize">
                      {tx.paymentMethod === 'cash' ? <DollarSign size={12}/> : <CreditCard size={12}/>}
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ${Number(tx.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                       <Calendar size={12} />
                       {new Date(tx.transactionTime).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                       <Clock size={12} />
                       {new Date(tx.transactionTime).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-xl text-gray-400 hover:text-blue-600 transition-all">
                       <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
           <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <CreditCard className="text-gray-300 w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white italic">No Transactions Found</h3>
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">The ledger currently holds no records matching your criteria.</p>
           </div>
        )}
      </div>
    </div>
  );
}
