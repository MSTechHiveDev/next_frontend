'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Package,
    AlertTriangle,
    FileText,
    ChevronRight,
    Loader2,
    PlusCircle,
    TrendingUp,
    Wallet,
    Users
} from 'lucide-react';
import { PharmacyDashboardService, DashboardStats } from '@/lib/integrations/services/pharmacyDashboard.service';
import Link from 'next/link';
import ExpiryAlertsModal from '@/components/pharmacy/dashboard/ExpiryAlertsModal';

const PharmacyDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const data = await PharmacyDashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (isLoading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Pharma Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Operational Oversight Dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExpiryModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all relative dark:bg-red-950/20 dark:border-red-900/30"
                    >
                        <AlertTriangle size={16} />
                        Expiry Alerts
                        {stats?.inventoryStats.expiringSoonCount ? (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white border-4 border-white dark:border-gray-900">
                                {stats.inventoryStats.expiringSoonCount}
                            </span>
                        ) : null}
                    </button>
                </div>
            </div>

            <ExpiryAlertsModal
                isOpen={isExpiryModalOpen}
                onClose={() => setIsExpiryModalOpen(false)}
            />

            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Today's Revenue", value: formatCurrency(stats?.todayStats.revenue || 0), sub: `${stats?.todayStats.billCount || 0} Transactions`, icon: DollarSign, color: "blue" },
                    { label: "Inventory Size", value: stats?.inventoryStats.totalProducts.toString() || "0", sub: "Active Stock Items", icon: Package, color: "indigo" },
                    { label: "Critical Stock", value: stats?.inventoryStats.lowStockCount.toString() || "0", sub: stats?.inventoryStats.outOfStockCount ? `${stats.inventoryStats.outOfStockCount} Depleted` : "Stable Registry", icon: AlertTriangle, color: "red" },
                    { label: "Session Bills", value: stats?.todayStats.billCount.toString() || "0", sub: "Dispatched Today", icon: FileText, color: "cyan" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative group hover:scale-[1.02] transition-all">
                        <div className={`absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform text-${stat.color}-600`}>
                            <stat.icon size={80} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color}-500`} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                {stat.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reusing existing links for simplicity but can be updated later if admin has specific billing views */}
                <Link href="/pharmacy/billing">
                    <button className="w-full flex items-center justify-between p-8 rounded-4xl bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                                <PlusCircle size={28} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black uppercase tracking-tight text-lg">New Dispatch</h4>
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Generate Billing Node</p>
                            </div>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all" size={24} />
                    </button>
                </Link>

                <Link href="/hospital-admin/pharma/products">
                    <button className="w-full flex items-center justify-between p-8 rounded-4xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                                <Package size={28} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black uppercase tracking-tight text-lg">Inventory</h4>
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Manage Registry</p>
                            </div>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all" size={24} />
                    </button>
                </Link>

                <Link href="/hospital-admin/pharma/transactions">
                    <button className="w-full flex items-center justify-between p-8 rounded-4xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                                <TrendingUp size={28} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black uppercase tracking-tight text-lg">Analytics</h4>
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Audit Transactions</p>
                            </div>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all" size={24} />
                    </button>
                </Link>
            </div>

            {/* Bottom Detail Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <FileText size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Session Summary</h4>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Real-Time</span>
                    </div>
                    <div className="p-8 space-y-4">
                        {[
                            { label: "Gross Revenue", value: formatCurrency(stats?.todayStats.revenue || 0), desc: "Total value generated in current cycle" },
                            { label: "Dispatch Volume", value: stats?.todayStats.billCount.toString() || "0", desc: "Total invoices confirmed" },
                            { label: "Average Value", value: formatCurrency(stats?.todayStats.avgBillValue || 0), desc: "Value density per transaction" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 dark:bg-gray-700/30 border border-gray-100/50">
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.label}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.desc}</p>
                                </div>
                                <span className="text-lg font-black text-blue-600">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Wallet size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Gateway Analysis</h4>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-2 gap-4">
                        {[
                            { label: "Cash", value: formatCurrency(stats?.paymentBreakdown.Cash || 0), color: "emerald" },
                            { label: "Card", value: formatCurrency(stats?.paymentBreakdown.Card || 0), color: "blue" },
                            { label: "UPI", value: formatCurrency(stats?.paymentBreakdown.UPI || 0), color: "purple" },
                            { label: "Mixed", value: formatCurrency(stats?.paymentBreakdown.Mixed || 0), color: "indigo" },
                            { label: "Credit", value: formatCurrency(stats?.paymentBreakdown.Credit || 0), color: "orange" },
                        ].map((method, idx) => (
                            <div key={idx} className="p-5 rounded-3xl bg-gray-50/50 dark:bg-gray-700/30 border border-gray-100/50 relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${method.color}-500`} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{method.label}</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{method.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap gap-4 items-center justify-center">
                <p className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Hub Access</p>
                {[
                    { label: "Inventory", href: "/hospital-admin/pharma/products" },
                    { label: "Suppliers", href: "/hospital-admin/pharma/suppliers" },
                    { label: "Transactions", href: "/hospital-admin/pharma/transactions" },
                    { label: "Direct Billing", href: "/pharmacy/billing" },
                ].map((link, i) => (
                    <Link key={i} href={link.href}>
                        <button className="px-6 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            {link.label}
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PharmacyDashboard;
