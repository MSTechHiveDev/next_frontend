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
    Microscope,
    Activity
} from 'lucide-react';
import { LabDashboardService, DashboardStats } from '@/lib/integrations/services/labDashboard.service';
import { toast } from 'react-hot-toast';

export default function HospitalAdminLabDashboard() {
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
                toast.error('Failed to load laboratory analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [range]);

    const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-${color}-500/5 rounded-full group-hover:scale-125 transition-transform duration-700`}></div>
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">{value}</h3>
                    {subValue && (
                        <div className="flex items-center gap-1.5 mt-3 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg w-fit">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{subValue}</span>
                        </div>
                    )}
                </div>
                <div className={`p-4 bg-${color}-50 dark:bg-${color}-500/10 rounded-2xl text-${color}-600 dark:text-${color}-400 shadow-sm shadow-${color}-100 dark:shadow-none`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    const rangeLabels: any = {
        'today': 'Temporal Today',
        '7days': 'Last 7 Cycles',
        '1month': 'Monthly Audit'
    };

    if (loading && !stats) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Lab Data...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Tier */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none">
                            <Microscope className="w-8 h-8 text-white" />
                        </div>
                        Lab Analytics Panel
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px] ml-1">Hospital-wide Diagnostic Intelligence Hub</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    {Object.keys(rangeLabels).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${range === r
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {rangeLabels[r]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenue Magnitude"
                    value={`₹${stats?.revenue.toLocaleString() || 0}`}
                    icon={TrendingUp}
                    color="blue"
                    subValue="+12.4% vs prev"
                />
                <StatCard
                    title="Liquid Collections"
                    value={`₹${stats?.collections.toLocaleString() || 0}`}
                    icon={Wallet}
                    color="emerald"
                />
                <StatCard
                    title="Active Patients"
                    value={stats?.patients || 0}
                    icon={Users}
                    color="indigo"
                />
                <StatCard
                    title="Protocol Count"
                    value={stats?.totalTests || 0}
                    icon={Layers}
                    color="purple"
                />
            </div>

            {/* Economic Gateway Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Economic Hub</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Payment Gateway Distribution</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">Cash Protocol</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Liquidity</p>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">₹{stats?.paymentBreakdown.Cash.toLocaleString() || 0}</h4>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">Digital UPI</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Digital Velocity</p>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">₹{stats?.paymentBreakdown.UPI.toLocaleString() || 0}</h4>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                                <Layers className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full">Credit Terminal</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Credit</p>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">₹{stats?.paymentBreakdown.Card.toLocaleString() || 0}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
