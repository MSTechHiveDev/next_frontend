'use client';

import React from 'react';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

// Mock Data for History
const attendanceHistory = [
   
    { date: '05/01/2026', arrival: '09:18', departure: '19:07', effectiveTime: '9h 49m', status: 'On Time' },
    { date: '03/01/2026', arrival: '08:20', departure: '21:31', effectiveTime: '13h 10m', status: 'On Time' },
   
];

export default function StaffDashboardPage() {
    const currentTime = "18:17"; // Mock time for static display

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good afternoon, </h1>
                    <p className="text-gray-500 mt-1">Here's what's happening with your attendance today.</p>
                </div>
                
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Today Status Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-gray-900">Today</span>
                        <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">Present</span>
                    </div>
                    <div className="flex items-center gap-4 my-6">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            {/* Simple CSS Circle for demo */}
                            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent -rotate-45"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-bold text-gray-900">100%</span>
                                <span className="text-[10px] text-gray-500 uppercase">Status</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 flex-1">
                            You have marked yourself as present today!
                        </p>
                    </div>
                    <div className="flex gap-3 mt-auto">
                        <button className="flex-1 py-2.5 px-3 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed" disabled>
                            Checked In
                        </button>
                        <button className="flex-1 py-2.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                            Check Out
                        </button>
                    </div>
                </div>

                {/* Middle Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Average Hours */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center">
                        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-3">
                            <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Average Hours</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">7h 51m</p>
                    </div>

                    {/* Avg Check-in */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3">
                            <LogIn className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Avg Check-in</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">3:49 AM</p>
                    </div>

                    {/* On-time Arrival */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-3">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">On-time Arrival</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">100%</p>
                    </div>

                    {/* Avg Check-out */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-3">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Avg Check-out</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">1:56 PM</p>
                    </div>
                </div>

                {/* My Attendance Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-gray-900">My Attendance</span>
                        <button className="text-xs text-blue-600 font-medium hover:underline">View Stats</button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 border-[6px] border-gray-100 rounded-full"></div>
                            <div className="absolute inset-0 border-[6px] border-green-500 rounded-full border-l-transparent border-b-transparent -rotate-45"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-gray-900">17</span>
                                <span className="text-[10px] text-gray-500">Total Days</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-gray-600">On Time</span>
                                </div>
                                <span className="font-bold text-gray-900">17</span>
                            </div>
                            <div className="flex items-center justify-between gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                    <span className="text-gray-600">Late</span>
                                </div>
                                <span className="font-bold text-gray-900">0</span>
                            </div>
                            <div className="flex items-center justify-between gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    <span className="text-gray-600">Absent</span>
                                </div>
                                <span className="font-bold text-gray-900">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-gray-900 text-lg">Working History</h2>
                    <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                        Show all <span className="text-xs">›</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Arrival</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Departure</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Effective Time</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {attendanceHistory.map((record, index) => (
                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{record.date}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{record.arrival}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{record.departure}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{record.effectiveTime}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${record.status === 'On Time'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                            {record.status}
                                        </span>
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
