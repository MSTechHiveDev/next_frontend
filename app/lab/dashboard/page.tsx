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
    Network,
    Activity
} from 'lucide-react';
import { LabDashboardService, DashboardStats } from '@/lib/integrations/services/labDashboard.service';
import { LabSampleService } from '@/lib/integrations/services/labSample.service';
import { LabSample } from '@/lib/integrations/types/labSample';
import { toast } from 'react-hot-toast';
import { subscribeToSocket, unsubscribeFromSocket } from '@/lib/integrations/api/socket';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function LabDashboard() {
    const [range, setRange] = useState('today');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activeTests, setActiveTests] = useState<LabSample[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [statsData, samplesData] = await Promise.all([
                    LabDashboardService.getStats(range),
                    LabSampleService.getSamples('Pending')
                ]);
                setStats(statsData);
                setActiveTests(samplesData.slice(0, 5)); // Show top 5 pending
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [range]);

    // Socket Integration
    useEffect(() => {
        if (!user?.hospitalId) return;

        const handleNewLabOrder = (newOrder: any) => {
            // Add new order to top of active list
            setActiveTests(prev => {
                if (prev.some(s => s._id === newOrder._id)) return prev;

                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-indigo-500`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="shrink-0 pt-0.5">
                                    <Microscope className="h-10 w-10 text-indigo-500" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">New Active Test!</p>
                                    <p className="mt-1 text-xs text-gray-500">Patient: {newOrder.patientDetails?.name}</p>
                                    <p className="text-xs text-indigo-500 font-bold mt-1">Added to Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ));

                return [newOrder, ...prev].slice(0, 10); // Keep top 10
            });

            // Refresh stats silently
            LabDashboardService.getStats(range).then(setStats).catch(() => { });
        };

        const channel = `hospital_${user.hospitalId}`;
        subscribeToSocket(channel, 'new_lab_order', handleNewLabOrder);

        return () => {
            unsubscribeFromSocket(channel, 'new_lab_order', handleNewLabOrder);
        };
    }, [user?.hospitalId, range]);

    const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => {
        const colorVariants: any = {
            indigo: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
            emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
            blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
            purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
            rose: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
        };

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
                        {subValue && (
                            <div className="flex items-center gap-1.5 mt-3 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-fit">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{subValue}</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3.5 rounded-2xl ${colorVariants[color] || colorVariants.indigo} transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-50 dark:bg-gray-700/20 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
            </div>
        );
    };

    const rangeLabels: any = {
        'today': 'Today',
        '7days': 'Last 7 Days',
        '1month': 'Last 1 Month'
    };

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Microscope className="w-6 h-6 text-indigo-600 animate-pulse" />
                    </div>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Lab Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Microscope className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Lab Dashboard</h1>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        Real-time <span className="text-indigo-600 dark:text-indigo-400">Statistics & Overview</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700 w-fit">
                    {Object.keys(rangeLabels).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${range === r
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600/50'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            {rangeLabels[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
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
                    title="Master List"
                    value={stats?.totalTestMaster || 0}
                    icon={Layers}
                    color="purple"
                    subValue={stats?.totalTests ? `${stats.totalTests} done` : undefined}
                />
                <StatCard
                    title="Units"
                    value={stats?.totalDepartments || 0}
                    icon={Network}
                    color="orange"
                />
                <StatCard
                    title="Pending"
                    value={stats?.pendingSamples || 0}
                    icon={ClipboardList}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Active Projects / Tests */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-rose-500" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Pending Lab Orders</h2>
                            <div className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{activeTests.length} Active Orders</span>
                            </div>
                        </div>
                        <Link href="/lab/samples" className="group flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-all">
                            Lab Samples <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden min-h-[400px]">
                        {activeTests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-full">
                                    <ClipboardList className="w-12 h-12 text-gray-200" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">All Caught Up</p>
                                    <p className="text-xs text-gray-300 font-medium">No active samples require attention</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sample ID</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Details</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested Tests</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {activeTests.map((test) => (
                                            <tr key={test._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg w-fit mb-1 border border-indigo-100 dark:border-indigo-800">
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs tracking-tight">{test.sampleId}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(test.createdAt).toLocaleTimeString()}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{test.patientDetails.name}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">{test.patientDetails.age}Y • {test.patientDetails.gender}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {test.tests.slice(0, 2).map((t, i) => (
                                                            <span key={i} className="bg-slate-50 dark:bg-gray-700/50 text-slate-600 dark:text-gray-300 px-2.5 py-1 rounded-lg text-[9px] font-bold border border-slate-100 dark:border-gray-600 uppercase tracking-wider">
                                                                {t.testName}
                                                            </span>
                                                        ))}
                                                        {test.tests.length > 2 && (
                                                            <span className="text-[10px] text-indigo-400 font-bold self-center">+{test.tests.length - 2} ADD</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-amber-100 dark:border-amber-900/30">
                                                        {test.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Link href={`/lab/samples`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 dark:shadow-none translate-y-0 active:scale-95">
                                                        Collect
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Analytics / Payment Breakdown */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Payment Breakdown</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Cash Collection', value: stats?.paymentBreakdown.Cash || 0, icon: Wallet, color: 'emerald' },
                            { label: 'UPI Settlements', value: stats?.paymentBreakdown.UPI || 0, icon: ArrowUpRight, color: 'blue' },
                            { label: 'Card Terminals', value: stats?.paymentBreakdown.Card || 0, icon: Layers, color: 'purple' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between group transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[2px] mb-1">{item.label}</p>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">₹{item.value.toLocaleString()}</h4>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Access Card */}
                    <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Need Reports?</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Access and export comprehensive diagnostic records for the selected period.</p>
                            <button className="bg-white text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                                Export Summary
                            </button>
                        </div>
                        <Layers className="absolute -bottom-8 -right-8 w-40 h-40 text-indigo-500/20 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
