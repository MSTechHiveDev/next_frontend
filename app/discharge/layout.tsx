'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import { LayoutDashboard, FileText, ClipboardList, LogOut, Settings } from 'lucide-react';
import LogoutModal from '@/components/auth/LogoutModal';
import toast from 'react-hot-toast';

const dischargeMenuItems: SidebarItem[] = [
    { icon: FileText, label: 'Discharge Form', href: '/discharge' },
    { icon: ClipboardList, label: 'Discharge History', href: '/discharge/history' },
];

export default function DischargeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isLoginPage = pathname === '/discharge/login';

    useEffect(() => {
        // Only run auth check if not on login page
        if (isLoginPage) {
            setIsLoading(false);
            return;
        }

        // Simple auth check for Discharge role
        const storedUser = sessionStorage.getItem("user");
        const userRole = sessionStorage.getItem("userRole");

        if (!storedUser || userRole !== "DISCHARGE") {
            router.push("/discharge/login");
            return;
        }

        setUser(JSON.parse(storedUser));
        setIsLoading(false);
    }, [router, isLoginPage]);

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("user");
        router.push("/discharge/login");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Checking Credentials</p>
                </div>
            </div>
        );
    }

    const navUser = {
        name: user?.name || "Discharge Lead",
        role: "Discharge Personnel",
        image: ""
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className={`flex min-h-screen ${isDarkMode ? 'dark' : ''} bg-[#f8fafc] dark:bg-slate-950`}>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                userName={user?.name}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                items={dischargeMenuItems}
                onLogout={() => setIsLogoutModalOpen(true)}
            />

            <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
                <Navbar
                    title="Discharge Portal"
                    user={navUser}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                    onLogout={() => setIsLogoutModalOpen(true)}
                    className="sticky top-0 z-30"
                    
                />

                <main className="p-6 lg:p-10 flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
