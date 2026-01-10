'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    ClipboardList,
    Layers,
    Wallet,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Microscope
} from 'lucide-react';
import { LabDashboardService, DashboardStats } from '@/lib/integrations/services/labDashboard.service';
import { toast } from 'react-hot-toast';

export default function LabDashboard() {
    const [range, setRange] = useState('today');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await LabDashboardService.getStats(range);
                setStats(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [range]);

    const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${color}-50 dark:bg-${color}-900/20 rounded-full group-hover:scale-110 transition-transform duration-500 opacity-50`}></div>
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{value}</h3>
                    {subValue && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        {subValue}
                    </p>}
                </div>
                <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-xl text-${color}-600 dark:text-${color}-400`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    const rangeLabels: any = {
        'today': 'Today',
        '7days': 'Last 7 Days',
        '1month': 'Last 1 Month'
    };

    if (loading && !stats) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading Analytics...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30 dark:bg-gray-900 transition-colors duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Microscope className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Lab Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Real-time laboratory diagnostics & performance tracking</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    {Object.keys(rangeLabels).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${range === r
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {rangeLabels[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                <StatCard
                    title="Revenue"
                    value={`₹${stats?.revenue.toLocaleString() || 0}`}
                    icon={TrendingUp}
                    color="indigo"
                />
                <StatCard
                    title="Collections"
                    value={`₹${stats?.collections.toLocaleString() || 0}`}
                    icon={Wallet}
                    color="emerald"
                />
                <StatCard
                    title="Patients"
                    value={stats?.patients || 0}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Total Tests"
                    value={stats?.totalTests || 0}
                    icon={Layers}
                    color="purple"
                />
                <StatCard
                    title="Pending"
                    value={stats?.pendingSamples || 0}
                    icon={ClipboardList}
                    color="rose"
                />
            </div>

            {/* Payment Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash Collection</p>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">₹{stats?.paymentBreakdown.Cash.toLocaleString() || 0}</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UPI Collection</p>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">₹{stats?.paymentBreakdown.UPI.toLocaleString() || 0}</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Card Collection</p>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">₹{stats?.paymentBreakdown.Card.toLocaleString() || 0}</h4>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}

        </div>
    );
}
