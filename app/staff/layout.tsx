'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import { LayoutDashboard, CalendarCheck, Calendar, Clock, Bell, User, ReceiptText, BookOpenCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import LogoutModal from '@/components/auth/LogoutModal';

const staffMenuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/staff' },
    { icon: CalendarCheck, label: 'Leave & Absence', href: '/staff/leaves' },
    { icon: BookOpenCheck, label: 'My Schedule', href: '/staff/schedule' },
    { icon: Bell, label: 'Announcements', href: '/staff/announcements' },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, logout, isInitialized, isAuthenticated, isLoading, checkAuth, initEvents } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        initEvents();
        checkAuth();
    }, []);

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (user?.role !== 'staff') {
                const routeMap: Record<string, string> = {
                    'doctor': '/doctor',
                    'hospital-admin': '/hospital-admin',
                    'lab': '/lab/dashboard',
                    'pharmacy': '/pharmacy/dashboard',
                    'pharma-owner': '/pharmacy/dashboard',
                    'super-admin': '/admin',
                    'admin': '/admin'
                };
                router.push(routeMap[user?.role || ''] || '/auth/login');
            }
        }
    }, [isInitialized, isAuthenticated, user?.role, router]);

    const handleConfirmLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    // Premium Loading State
    if (isLoading || !isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-indigo-600/20 border-b-indigo-600 rounded-full animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Initializing Portal</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-1">Verifying Credentials • MScurechain</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'staff') return null;

    const staffUser = {
        name: user?.name || "Staff Member",
        role: user?.role || "Staff",
        image: (user as any)?.image || ""
    };

    return (
        <div className={`flex min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                userName={user?.name}
            />
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                items={staffMenuItems}
                onLogout={() => setIsLogoutModalOpen(true)}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64' /* Simple desktop persistence */}`}>

                {/* Navbar */}
                <Navbar
                    title="Staff Portal"
                    user={staffUser}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                    onLogout={() => setIsLogoutModalOpen(true)}
                    className="sticky top-0 z-30"
                />

                {/* Page Content */}
                <main className="p-6 flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
