'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  ChevronRight, 
  ChevronDown,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { hospitalAdminService } from '@/lib/integrations/services/hospitalAdmin.service';
import { toast } from 'react-hot-toast';

interface PayrollMember {
  _id: string;
  name: string;
  designation: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  status: string;
  joiningDate: string;
  history: Array<{
    month: string;
    year: number;
    status: string;
    amount: number;
  }>;
}

export default function PayrollMatrix() {
  const [payroll, setPayroll] = useState<PayrollMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await hospitalAdminService.getPayroll();
      setPayroll(res.payroll || []);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpediture = () => {
    return payroll.reduce((sum, member) => sum + member.basicSalary + member.allowances, 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Payroll Matrix</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1">Manage personnel compensation and financial settlements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-sm font-black hover:bg-gray-50 transition-all shadow-sm border border-gray-100 dark:border-gray-700">
            <Download className="w-5 h-5" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none">
            <DollarSign className="w-5 h-5" /> Bulk Process
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                  <CreditCard className="w-6 h-6" />
               </div>
               <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Monthly Commitment</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">₹{(calculateTotalExpediture()/100000).toFixed(2)}L</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Activity className="w-6 h-6" />
               </div>
               <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Growth Delta</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">+14.2%</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg uppercase">Audit Pass</span>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compliance Status</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Active</h3>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600">
                  <Calendar className="w-6 h-6" />
               </div>
               <span className="text-rose-600 text-[10px] font-black uppercase italic">T-4 Days</span>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Next Payout</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">Jan 01, 2026</h3>
         </div>
      </div>

      {/* Controller Area */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="w-5 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search personnel nomenclature or ID..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none shadow-sm rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex items-center gap-2 px-5 py-4 bg-white dark:bg-gray-800 text-gray-400 border-none shadow-sm rounded-2xl text-sm font-bold hover:text-blue-500 transition-all">
            <Filter className="w-5 h-5" /> Hierarchy Filter
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 text-gray-400 border-none shadow-sm rounded-2xl hover:text-blue-500 transition-all">
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/20">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel Identifier</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation Hub</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Base Remuneration</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Allowances</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Gross Settlement</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operational Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-400 font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Loading Transactional Data...</p>
                  </td>
                </tr>
              ) : payroll.map((member) => (
                <React.Fragment key={member._id}>
                  <tr className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group ${expandedId === member._id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-black text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{member.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest">{member.employeeId || 'ID_PENDING'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{member.designation || 'Staff'}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-sm font-black text-gray-900 dark:text-white">₹{member.basicSalary.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-sm font-bold text-emerald-600">+₹{member.allowances.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-sm font-black text-blue-600 outline-none">₹{(member.basicSalary + member.allowances).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {member.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setExpandedId(expandedId === member._id ? null : member._id)}
                            className={`p-2 rounded-lg transition-all ${expandedId === member._id ? 'bg-blue-100 text-blue-600' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'}`}
                          >
                             {expandedId === member._id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                          <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                             <MoreVertical size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                  
                  {/* Expanded History */}
                  {expandedId === member._id && (
                    <tr>
                      <td colSpan={7} className="px-8 py-8 bg-gray-50/50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Historical Settlement Log</h4>
                              <div className="space-y-3">
                                 {member.history.map((h, i) => (
                                   <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600">
                                            <ShieldCheck size={16} />
                                         </div>
                                         <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{h.month} {h.year}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Verified</p>
                                         </div>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-xs font-black text-gray-900 dark:text-white">₹{h.amount.toLocaleString()}</p>
                                         <p className="text-[10px] font-black text-emerald-500 uppercase">{h.status}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Contractual Metadata</h4>
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                       <span className="text-gray-400">Onboarding Date</span>
                                       <span className="text-gray-900 dark:text-white">{new Date(member.joiningDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                       <span className="text-gray-400">ESIC Eligibility</span>
                                       <span className="text-emerald-500 uppercase">Confirmed</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                       <span className="text-gray-400">PF Contribution</span>
                                       <span className="text-gray-900 dark:text-white">12% Enforced</span>
                                    </div>
                                 </div>
                              </div>
                              <button className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl">
                                 <FileText size={14} /> Generate Payslip
                              </button>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
