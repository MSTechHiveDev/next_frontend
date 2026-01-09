'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Package,
    AlertTriangle,
    FileText,
    ChevronRight,
    Maximize2,
    RefreshCcw,
    PlusCircle,
    TrendingUp,
    CreditCard,
    CreditCard as UpiIcon, // Placeholder for UPI
    Wallet,
    Users,
    Loader2
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
        <div className="space-y-6">
            {/* Header with Title and Control Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--secondary-color)' }}>
                        Real-time overview of your pharmacy performance
                    </p> a
                </div>
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setIsExpiryModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-red-50 text-sm font-medium transition-all hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/30 relative"
                    >
                        <AlertTriangle size={16} />
                        Expiry Alerts
                        {stats?.inventoryStats.expiringSoonCount ? (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "TODAY'S SALES", value: formatCurrency(stats?.todayStats.revenue || 0), sub: `${stats?.todayStats.billCount || 0} invoices`, icon: DollarSign, color: "emerald" },
                    { label: "TOTAL PRODUCTS", value: stats?.inventoryStats.totalProducts.toString() || "0", sub: "Active products", icon: Package, color: "purple" },
                    { label: "LOW STOCK ITEMS", value: stats?.inventoryStats.lowStockCount.toString() || "0", sub: stats?.inventoryStats.outOfStockCount ? `${stats.inventoryStats.outOfStockCount} Out of Stock` : "Need attention", icon: AlertTriangle, color: "red" },
                    { label: "TODAY'S BILLS", value: stats?.todayStats.billCount.toString() || "0", sub: "Bills generated today", icon: FileText, color: "indigo" },
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 rounded-2xl shadow-sm border flex justify-between items-start transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <div>
                            <p className="text-xs font-bold tracking-wider mb-2" style={{ color: 'var(--secondary-color)' }}>{stat.label}</p>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>{stat.value}</h3>
                            <span className="text-[10px] px-2 py-1 rounded-full border bg-gray-50 dark:bg-gray-800" style={{ borderColor: 'var(--border-color)', color: 'var(--secondary-color)' }}>
                                {stat.sub}
                            </span>
                        </div>
                        <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600 dark:bg-${stat.color}-900/40 dark:text-${stat.color}-400`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/pharmacy/billing">
                    <button className="w-full flex items-center justify-between p-6 rounded-2xl border bg-emerald-50/50 hover:bg-emerald-50 transition-all group dark:bg-emerald-950/20" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                <PlusCircle size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Create Invoice</h4>
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">New bill</p>
                            </div>
                        </div>
                        <ChevronRight className="text-emerald-400 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>

                <Link href="/pharmacy/products">
                    <button className="w-full flex items-center justify-between p-6 rounded-2xl border bg-purple-50/50 hover:bg-purple-50 transition-all group dark:bg-purple-950/20" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                                <Package size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-purple-800 dark:text-purple-400">Manage Products</h4>
                                <p className="text-xs text-purple-600/70 dark:text-purple-400/60">Inventory</p>
                            </div>
                        </div>
                        <ChevronRight className="text-purple-400 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>

                <Link href="/pharmacy/transactions">
                    <button className="w-full flex items-center justify-between p-6 rounded-2xl border bg-green-50/50 hover:bg-green-50 transition-all group dark:bg-green-950/20" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-green-800 dark:text-green-400">View Reports</h4>
                                <p className="text-xs text-green-600/70 dark:text-green-400/60">Transactions</p>
                            </div>
                        </div>
                        <ChevronRight className="text-green-400 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>

            {/* Bottom Detail Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Summary */}
                <div className="rounded-2xl border bg-indigo-50/30 overflow-hidden dark:bg-indigo-950/10" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="p-4 border-b bg-indigo-50/50 dark:bg-indigo-900/20 flex items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="p-2 rounded-lg bg-indigo-500 text-white">
                            <FileText size={18} />
                        </div>
                        <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>Today's Summary</h4>
                    </div>
                    <div className="p-4 space-y-3">
                        {[
                            { label: "Total Revenue", value: formatCurrency(stats?.todayStats.revenue || 0), color: "blue-600" },
                            { label: "Total Bills", value: stats?.todayStats.billCount.toString() || "0", color: "gray-800" },
                            { label: "Avg. Bill Value", value: formatCurrency(stats?.todayStats.avgBillValue || 0), color: "blue-500" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border dark:bg-gray-800/40" style={{ borderColor: 'var(--border-color)' }}>
                                <span className="text-sm font-medium" style={{ color: 'var(--secondary-color)' }}>{item.label}</span>
                                <span className={`font-bold text-${item.color} dark:text-white`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="rounded-2xl border bg-emerald-50/30 overflow-hidden dark:bg-emerald-950/10" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="p-4 border-b bg-emerald-50/50 dark:bg-emerald-900/20 flex items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="p-2 rounded-lg bg-emerald-500 text-white">
                            <Wallet size={18} />
                        </div>
                        <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>Payment Methods</h4>
                    </div>
                    <div className="p-4 space-y-2">
                        {[
                            { label: "Cash", value: formatCurrency(stats?.paymentBreakdown.Cash || 0), color: "emerald-500" },
                            { label: "Card", value: formatCurrency(stats?.paymentBreakdown.Card || 0), color: "blue-500" },
                            { label: "UPI", value: formatCurrency(stats?.paymentBreakdown.UPI || 0), color: "purple-500" },
                            { label: "Mixed", value: formatCurrency(stats?.paymentBreakdown.Mixed || 0), color: "indigo-500" },
                            { label: "Credit", value: formatCurrency(stats?.paymentBreakdown.Credit || 0), color: "orange-500" },
                        ].map((method, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border dark:bg-gray-800/40 transition-all hover:bg-white" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full bg-${method.color}`} />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{method.label}</span>
                                </div>
                                <span className="font-bold" style={{ color: 'var(--text-color)' }}>{method.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions List */}
                <div className="rounded-2xl border bg-emerald-50/30 overflow-hidden dark:bg-emerald-950/10" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="p-4 border-b bg-emerald-50/50 dark:bg-emerald-900/20 flex items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="p-2 rounded-lg bg-emerald-500 text-white">
                            <TrendingUp size={18} />
                        </div>
                        <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>Quick Actions</h4>
                    </div>
                    <div className="p-4 space-y-2">
                        {[
                            { label: "Pharmacy Billing", icon: DollarSign, href: "/pharmacy/billing" },
                            { label: "All Invoices", icon: FileText, href: "/pharmacy/transactions" },
                            { label: "Manage Products", icon: Package, href: "/pharmacy/products" },
                            { label: "Suppliers", icon: Users, href: "/pharmacy/suppliers" },
                        ].map((action, idx) => (
                            <Link key={idx} href={action.href}>
                                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/60 border dark:bg-gray-800/40 hover:bg-white transition-all group mb-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1 px-2 border rounded-lg bg-gray-50 dark:bg-gray-900 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                                            <action.icon size={16} className="text-gray-500 group-hover:text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{action.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PharmacyDashboard;
