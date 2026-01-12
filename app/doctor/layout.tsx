'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    User,
    Settings,
    LogOut,
    Menu,
    Bell,
    Search,
    Activity,
    Clock
} from "lucide-react";
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationCenter from "@/components/navbar/NotificationCenter";
import LogoutModal from "@/components/auth/LogoutModal";

const doctorMenu = [
    {
        group: "Main",
        items: [
            { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/doctor" },
            { icon: <Activity size={20} />, label: "Analytics", path: "/doctor/analytics" },
        ]
    },
    {
        group: "Clinical Management",
        items: [
            { icon: <Users size={20} />, label: "Patients", path: "/doctor/patients" },
            { icon: <Calendar size={20} />, label: "Appointments", path: "/doctor/appointments" },
            { icon: <FileText size={20} />, label: "Prescriptions", path: "/doctor/prescription" },
        ]
    },
    {
        group: "Personnel",
        items: [
            { icon: <Clock size={20} />, label: "Leave Requests", path: "/doctor/leaves" },
        ]
    },
    {
        group: "System",
        items: [
            { icon: <Bell size={20} />, label: "Announcements", path: "/doctor/announcements" },
            { icon: <Settings size={20} />, label: "Support & Feedback", path: "/doctor/support" },
        ]
    }
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isLoading, isInitialized } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (user?.role !== 'doctor') {
                // REDIRECT PROTECTION: Ensure staff/admin don't end up here
                const routeMap: Record<string, string> = {
                    'staff': '/staff',
                    'hospital-admin': '/hospital-admin',
                    'pharmacy': '/pharmacy/dashboard',
                    'pharma-owner': '/pharmacy/dashboard',
                    'lab': '/lab/dashboard',
                    'super-admin': '/admin',
                    'admin': '/admin'
                };
                router.push(routeMap[user?.role || ''] || '/auth/login');
            }
        }
    }, [isAuthenticated, isInitialized, user?.role, router]);

    const handleConfirmLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    // Show premium loading state
    if (isLoading || !isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-teal-600/20 border-b-teal-600 rounded-full animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xl font-black text-foreground uppercase tracking-tighter italic text-center">Doctor Portal</p>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest text-center mt-1">Verifying Clinical Node</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'doctor') return null;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Logout Modal */}
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                userName={user?.name}
            />
            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-full w-64 bg-card border-r border-border-theme z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-border-theme gap-2">
                    <div className="w-8 h-8 bg-primary-theme rounded-lg flex items-center justify-center text-primary-theme-foreground">
                        <Activity size={20} />
                    </div>
                    <h1 className="text-lg font-bold text-foreground">
                        Doctor Portal
                    </h1>
                </div>

                <nav className="p-4 space-y-8 h-[calc(100vh-64px)] overflow-y-auto">
                    {doctorMenu.map((group) => (
                        <div key={group.group} className="space-y-2">
                            <h3 className="px-4 text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                                {group.group}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                router.push(item.path);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full group
                                                ${isActive
                                                    ? 'bg-primary-theme text-primary-theme-foreground shadow-lg shadow-blue-200 dark:shadow-none'
                                                    : 'text-muted hover:bg-secondary-theme hover:text-foreground'}
                                            `}
                                        >
                                            <span className={`${isActive ? 'text-primary-theme-foreground' : 'text-muted group-hover:text-primary-theme'} transition-colors`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>


            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <header className="h-16 bg-card border-b border-border-theme flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-muted"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 max-w-md mx-4 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search records, patients..."
                                className="w-full pl-10 pr-4 py-2 bg-secondary-theme border border-border-theme rounded-xl text-sm focus:ring-2 focus:ring-primary-theme outline-none transition-all text-foreground placeholder-muted"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <NotificationCenter />

                        <div className="h-8 w-px bg-border-theme mx-2"></div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-foreground">Dr. {user?.name}</p>
                                    <p className="text-xs text-muted">Doctor</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary-theme flex items-center justify-center text-primary-theme-foreground font-bold shadow-lg hover:shadow-xl transition-shadow">
                                    {user?.name?.charAt(0)}
                                </div>
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-border-theme z-40 overflow-hidden bg-card">
                                        <div className="p-4 border-b border-border-theme">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-primary-theme flex items-center justify-center text-primary-theme-foreground font-bold text-lg shadow">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">Dr. {user?.name}</p>
                                                    <p className="text-xs text-muted">Medical Doctor</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <button
                                                onClick={() => { router.push('/doctor/profile'); setIsProfileDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted hover:bg-secondary-theme transition-colors"
                                            >
                                                <User size={18} className="text-primary-theme" />
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
