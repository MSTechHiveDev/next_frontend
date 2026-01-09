'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard,
    UserPlus,
    CalendarCheck,
    Stethoscope,
    Truck,
    CreditCard,
    AlertCircle,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    Users
} from "lucide-react";
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationCenter from "@/components/navbar/NotificationCenter";
import LogoutModal from "@/components/auth/LogoutModal";

const helpdeskMenu = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/helpdesk" },
    { icon: <UserPlus size={20} />, label: "Patient Registration", path: "/helpdesk/patient-registration" },
    { icon: <Users size={20} />, label: "Patients", path: "/helpdesk/patients" },
    { icon: <CalendarCheck size={20} />, label: "Appointment Booking", path: "/helpdesk/appointment-booking" },
    { icon: <Stethoscope size={20} />, label: "Doctors", path: "/helpdesk/doctors" },
    { icon: <Truck size={20} />, label: "Transits", path: "/helpdesk/transits" },
    { icon: <CreditCard size={20} />, label: "Transactions", path: "/helpdesk/transactions" },
    { icon: <AlertCircle size={20} />, label: "Emergency Accept", path: "/helpdesk/emergency-accept" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isLoading, isInitialized } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Auth guard
    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (user?.role !== 'helpdesk') {
                const routeMap: Record<string, string> = {
                    'staff': '/staff',
                    'doctor': '/doctor',
                    'hospital-admin': '/hospital-admin',
                    'lab': '/lab/dashboard',
                    'pharma-owner': '/pharmacy/dashboard',
                    'pharmacy': '/pharmacy/dashboard',
                    'super-admin': '/admin',
                    'admin': '/admin',
                    'patient': '/patient'
                };
                router.push(routeMap[user?.role || ''] || '/auth/login');
            }
        }
    }, [isAuthenticated, isInitialized, user?.role, router]);

    const handleConfirmLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    // Premium Loading UI
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
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-center">HelpDesk Portal</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-1">Verifying Operational Access</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'helpdesk') return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Logout Modal */}
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                userName={user?.name}
            />
            {/* Sidebar for Desktop */}
            <aside className={`
                fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
                        HelpDesk Portal
                    </h1>
                </div>

                <nav className="p-4 space-y-1">
                    {helpdeskMenu.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    router.push(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600'}
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        );
                    })}
                </nav>


            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top Navbar */}
                <header className="h-16 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-600 dark:text-gray-400"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 max-w-md mx-4 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search patients, doctors..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <NotificationCenter />

                        <div className="h-8 w-px bg-gray-200 dark:border-gray-800 mx-2"></div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Helpdesk</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow">
                                    {user?.name?.charAt(0)}
                                </div>
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-40 overflow-hidden bg-white dark:bg-[#111]">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Helpdesk Staff</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <button
                                                onClick={() => { router.push('/helpdesk/profile'); setIsProfileDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <User size={18} className="text-blue-600" />
                                                <span>My Profile</span>
                                            </button>
                                            <button
                                                onClick={() => { setIsLogoutModalOpen(true); setIsProfileDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8 flex-1">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
