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
                                <div className="flex-shrink-0 pt-0.5">
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
                    value={stats?.totalTestMaster || 0}
                    icon={Layers}
                    color="purple"
                    subValue={stats?.totalTests ? `${stats.totalTests} performed` : undefined}
                />
                <StatCard
                    title="Departments"
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

            {/* Active Tests Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-rose-500 animate-pulse" />
                        Active Patient Tests
                        <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-full">{activeTests.length} Pending</span>
                    </h2>
                    <Link href="/lab/samples" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View All Samples <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {activeTests.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No active tests at the moment</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-400 font-black tracking-widest">
                                    <tr>
                                        <th className="p-4 pl-6">Token / ID</th>
                                        <th className="p-4">Patient</th>
                                        <th className="p-4">Tests</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-right pr-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {activeTests.map((test) => (
                                        <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
                                            <td className="p-4 pl-6">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm block">{test.tokenNumber || test.sampleId}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(test.createdAt).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{test.patientDetails.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">{test.patientDetails.age}Y • {test.patientDetails.gender}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {test.tests.slice(0, 2).map((t, i) => (
                                                        <span key={i} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100 dark:border-purple-800">
                                                            {t.testName}
                                                        </span>
                                                    ))}
                                                    {test.tests.length > 2 && (
                                                        <span className="text-[10px] text-gray-400 font-bold self-center">+{test.tests.length - 2} more</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide">
                                                    {test.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <Link href={`/lab/samples`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                                    Collect Sample
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

            {/* Bottom Section */}

        </div>
    );
}
