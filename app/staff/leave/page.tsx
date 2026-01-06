'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Save, Trash2 } from 'lucide-react';

interface LeaveRequest {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    appliedOn: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export default function LeavePage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);

    useEffect(() => {
        // Load leaves from localStorage on mount
        const savedLeaves = localStorage.getItem('staffLeaves');
        if (savedLeaves) {
            setLeaveHistory(JSON.parse(savedLeaves));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate || !reason) return;

        const newLeave: LeaveRequest = {
            id: crypto.randomUUID(),
            startDate,
            endDate,
            reason,
            appliedOn: new Date().toLocaleDateString(),
            status: 'Pending'
        };

        const updatedLeaves = [newLeave, ...leaveHistory];
        setLeaveHistory(updatedLeaves);
        localStorage.setItem('staffLeaves', JSON.stringify(updatedLeaves));

        // Reset form
        setStartDate('');
        setEndDate('');
        setReason('');
    };

    const handleDelete = (id: string) => {
        const updatedLeaves = leaveHistory.filter(leave => leave.id !== id);
        setLeaveHistory(updatedLeaves);
        localStorage.setItem('staffLeaves', JSON.stringify(updatedLeaves));
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Apply for Leave Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <div className="flex items-center gap-2 mb-6 text-gray-900">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold">Apply for Leave</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Reason</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Sick leave, Family event..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm min-h-[100px] resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors shadow-sm"
                        >
                            Submit Request
                        </button>
                    </form>
                </div>

                {/* My Leave History Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">My Leave History</h2>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {leaveHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                                <p>No leave requests found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 sticky top-0">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applied On</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dates</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leaveHistory.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-600">{leave.appliedOn}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                                <div className="flex flex-col">
                                                    <span>{leave.startDate}</span>
                                                    <span className="text-xs text-gray-400">to</span>
                                                    <span>{leave.endDate}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                                                {leave.reason}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${leave.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        leave.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(leave.id)}
                                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                    title="Delete Request"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
