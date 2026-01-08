'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle
} from 'lucide-react';
import { staffService } from '@/lib/integrations';
import type { LeaveRequest, LeaveBalance } from '@/lib/integrations/types';
import toast from 'react-hot-toast';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'request'>('history');
  
  // Form state
  const [formData, setFormData] = useState({
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesRes, balanceRes] = await Promise.all([
        staffService.getLeaves(),
        staffService.getLeaveBalance()
      ]);
      setLeaves(leavesRes.leaves || []);
      setBalance(balanceRes.balance);
    } catch (error) {
      console.error('Failed to load leave data:', error);
      toast.error('Failed to load leave information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffService.createLeave(formData as any);
      toast.success('Leave request submitted successfully!');
      setFormData({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      setActiveTab('history');
      loadData();
    } catch (error) {
      console.error('Failed to submit leave:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock3 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">Request time off and track your leave history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab(activeTab === 'history' ? 'request' : 'history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              activeTab === 'request' 
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {activeTab === 'history' ? (
              <><Plus className="w-4 h-4" /> New Request</>
            ) : (
              <><Calendar className="w-4 h-4" /> View History</>
            )}
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sick Leave</p>
            <p className="text-2xl font-bold text-gray-900">
              {balance?.sick || 0} / {balance?.totalSick || 12} <span className="text-sm font-normal text-gray-400">days</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Casual Leave</p>
            <p className="text-2xl font-bold text-gray-900">
              {balance?.casual || 0} / {balance?.totalCasual || 10} <span className="text-sm font-normal text-gray-400">days</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Other Leaves</p>
            <p className="text-2xl font-bold text-gray-900">
              {balance?.other || 0} <span className="text-sm font-normal text-gray-400">days used</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form or Stats */}
        <div className="lg:col-span-1 space-y-6">
          {activeTab === 'request' ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Request Leave</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Leave Type</label>
                  <select 
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="emergency">Emergency Leave</option>
                    <option value="maternity">Maternity/Paternity Leave</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reason</label>
                  <textarea 
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Briefly explain the reason for your leave..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 pt-4 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all transform active:scale-95"
                >
                  Submit Request
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Leave Guidelines</h2>
              <div className="space-y-4">
                <div className="flex gap-3 text-sm">
                  <div className="mt-1 shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <p className="text-gray-600">Apply at least 2 days in advance for casual leaves.</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="mt-1 shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <p className="text-gray-600">Medical certificates are required for sick leaves exceeding 3 days.</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="mt-1 shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">3</div>
                  <p className="text-gray-600">Approval depends on staff availability in your department.</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">For urgent leaves like emergencies, please contact your department head directly after submitting the online request.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search requests..."
                    className="bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                  />
                </div>
                <button className="p-2 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          leave.leaveType === 'sick' ? 'bg-orange-50 text-orange-600' :
                          leave.leaveType === 'casual' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 capitalize">{leave.leaveType} Leave</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                              {getStatusIcon(leave.status)}
                              {leave.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Applied on {new Date(leave.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-gray-100 italic group-hover:border-gray-200 transition-all">
                            "{leave.reason}"
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-gray-900 font-bold">No leave applications found</h3>
                  <p className="text-gray-500 text-sm mt-1">When you apply for leave, it will appear here.</p>
                  <button 
                    onClick={() => setActiveTab('request')}
                    className="mt-6 text-indigo-600 font-bold hover:underline"
                  >
                    Apply for Leave now
                  </button>
                </div>
              )}
            </div>
            
            {leaves.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all">
                  Show All History <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}