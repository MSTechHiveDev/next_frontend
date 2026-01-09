'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import Navbar from '@/components/navbar/Navbar';
import LogoutModal from '@/components/auth/LogoutModal';
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
    const { user, logout, isAuthenticated, checkAuth, isInitialized, isLoading } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isPharma = user?.role === 'pharma-owner' || user?.role === 'pharmacy';

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
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (!isPharma) {
                const routeMap: Record<string, string> = {
                    'staff': '/staff',
                    'doctor': '/doctor',
                    'hospital-admin': '/hospital-admin',
                    'lab': '/lab/dashboard',
                    'super-admin': '/admin',
                    'admin': '/admin'
                };
                router.push(routeMap[user?.role || ''] || '/auth/login');
            }
        }
    }, [isAuthenticated, isInitialized, user?.role, router, isPharma]);

    // Handle logout
    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    // Premium Loading UI
    if (isLoading || !isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-blue-600/20 border-b-blue-600 rounded-full animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-center">Pharmacy Panel</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-1">Verifying Inventory Node</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !isPharma) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                items={pharmacyMenu}
                onLogout={() => setIsLogoutModalOpen(true)}
            />

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                userName={user?.name}
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
                    onLogout={() => setIsLogoutModalOpen(true)}
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
