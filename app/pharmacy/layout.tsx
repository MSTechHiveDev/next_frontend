'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import Navbar from '@/components/navbar/Navbar';
import {
    LayoutDashboard,
    Package,
    BarChart,
    PlusCircle,
    Users,
} from "lucide-react";

// Pharmacy specific menu items
const pharmacyMenu: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/pharmacy/dashboard" },
    { icon: PlusCircle, label: "Create Invoice", href: "/pharmacy/billing" },
    { icon: Package, label: " Products", href: "/pharmacy/products" },
    { icon: Users, label: "Suppliers", href: "/pharmacy/suppliers" },
    { icon: BarChart, label: "Transaction", href: "/pharmacy/transactions" },
];

const PharmacyLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { user, logout, isAuthenticated, checkAuth, isInitialized } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const pharmacyUser = user || {
        name: "Pharmacy User",
        role: "pharmacy",
        image: undefined,
    };

    // Auth guard
    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push('/auth/login');
        } else if (isInitialized && isAuthenticated && user?.role !== 'pharmacy') {
            // Redirect non-pharmacy users
            if (user?.role === 'admin' || user?.role === 'super-admin') {
                router.push('/admin');
            } else if (user?.role === 'lab') {
                router.push('/lab/dashboard');
            } else {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isInitialized, router, user]);

    // Handle logout
    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'pharmacy') {
        return null; 
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                items={pharmacyMenu}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all duration-300">
                <Navbar
                    user={{
                        name: pharmacyUser.name,
                        role: pharmacyUser.role,
                        image: (pharmacyUser as any).image
                    }}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                    title="Pharmacy Panel"
                />

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PharmacyLayout;
