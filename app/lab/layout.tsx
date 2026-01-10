'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import { Settings, LogOut, X, LayoutDashboard, FileText, Activity, FlaskConical } from "lucide-react";
import LogoutModal from "@/components/auth/LogoutModal";
import { ThemeToggle } from "@/components/ThemeToggle";

// Lab specific menu items
const labMenu = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/lab/dashboard" },
    { icon: FileText, label: "Billing", path: "/lab/billing" },
    { icon: Activity, label: "Transactions", path: "/lab/billing/transactions" },
    { icon: FlaskConical, label: "Samples", path: "/lab/samples" },
    { icon: FileText, label: "Departments", path: "/lab/departments" },
    { icon: FlaskConical, label: "Test Master", path: "/lab/tests" },
];

const LabLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isLoading, isInitialized } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchPlaceholder, setSearchPlaceholder] = useState("Search...");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const labUser = user || {
        name: "Lab User",
        role: "lab",
        avatar: null,
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
            } else if (user?.role !== 'lab') {
                const routeMap: Record<string, string> = {
                    'staff': '/staff',
                    'doctor': '/doctor',
                    'hospital-admin': '/hospital-admin',
                    'pharmacy': '/pharmacy/dashboard',
                    'pharma-owner': '/pharmacy/dashboard',
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
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-center">Lab Panel</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-1">Verifying Diagnostic Access</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'lab') return null;

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                userName={user?.name}
            />
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Close button for mobile */}
            {isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden fixed top-2 right-4 z-50 p-2 rounded-md shadow-md transition-all"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--secondary-color)'
                    }}
                >
                    <X size={24} />
                </button>
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-full w-64 text-(--secondary-color) flex flex-col z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                border-r
            `}
                style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    borderColor: 'var(--border-color)'
                }}
            >
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-6 border-b"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text tracking-wide">
                            Lab Panel
                        </h1>
                    </div>
                </div>

                {/* Scrollable menu area */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hide-scrollbar">
                    {labMenu.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    router.push(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'hover:text-(--text-color)'
                                    }`}
                                style={!isActive ? {
                                    backgroundColor: 'transparent',
                                    color: 'var(--secondary-color)'
                                } : {}}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Footer (Settings + Logout) */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        // onClick={() => router.push('/lab/settings')}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ color: 'var(--secondary-color)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                            e.currentTarget.style.color = 'var(--text-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--secondary-color)';
                        }}
                    >
                        <Settings size={20} />
                        Settings
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all duration-300 w-full max-w-full overflow-x-hidden">
                {/* Navbar */}
                <header className="h-16 flex items-center justify-between px-4 border-b"
                    style={{
                        backgroundColor: 'var(--navbar-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden"
                        style={{ color: 'var(--text-color)' }}
                    >
                        ☰
                    </button>
                    <div className="flex-1 max-w-md mx-4">
                        {/* Search bar if needed */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>{labUser.name}</span>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-full transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className="p-4 max-[600px]:p-2 flex-1 overflow-y-auto"
                    style={{ backgroundColor: 'var(--bg-color)' }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default LabLayout;