'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import { Settings, LogOut, X, LayoutDashboard, FileText, Activity, FlaskConical } from "lucide-react";
import LogoutModal from "@/components/auth/LogoutModal";
import { ThemeToggle } from "@/components/ThemeToggle";

import { LabSampleService } from "@/lib/integrations/services/labSample.service";
import { getSocket } from "@/lib/integrations/api/socket";

// Lab specific menu items
const labMenu = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/lab/dashboard" },
    { icon: FileText, label: "Billing", path: "/lab/billing" },
    { icon: Activity, label: "Transactions", path: "/lab/billing/transactions" },
    { icon: FlaskConical, label: "Samples", path: "/lab/samples" },
    { icon: FlaskConical, label: "Active Lab Tests", path: "/lab/active-tests", hasBadge: true },
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
    const [activeTestCount, setActiveTestCount] = useState(0);

    const labUser = user || {
        name: "Lab User",
        role: "lab",
        avatar: null,
    };

    // Auth guard
    // Check if on login page
    const isLoginPage = pathname === '/lab/login';

    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoginPage && isInitialized) {
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
    }, [isAuthenticated, isInitialized, user?.role, router, isLoginPage]);

    // Fetch active count and listen for updates
    useEffect(() => {
        let socketInstance: any = null;

        if (isAuthenticated && user?.role === 'lab') {
            const fetchCount = async () => {
                try {
                    const pending = await LabSampleService.getSamples('Pending');
                    const processing = await LabSampleService.getSamples('In Processing');
                    const totalCount = pending.length + processing.length;
                    setActiveTestCount(totalCount);
                    console.log(`🔔 Updated badge count: ${totalCount}`);
                } catch (error) {
                    console.error("Failed to fetch active count", error);
                }
            };

            // Initial fetch
            fetchCount();

            // Refresh count when page becomes visible
            const handleVisibilityChange = () => {
                if (!document.hidden) {
                    console.log('🔔 Page visible - refreshing badge count');
                    fetchCount();
                }
            };

            // Refresh count when window gains focus
            const handleFocus = () => {
                console.log('🔔 Window focused - refreshing badge count');
                fetchCount();
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('focus', handleFocus);

            const initSocket = async () => {
                socketInstance = await getSocket();
                if (socketInstance) {
                    const handleNewOrder = () => {
                        setActiveTestCount(prev => prev + 1);
                    };

                    // Listen for new orders
                    socketInstance.on('new_lab_order', handleNewOrder);

                    // Store cleanup function in a way we can access it? 
                    // UseEffect cleanup can't be async easily.
                    // We'll attach a listener and remove it in the return.
                    // But initSocket is async...
                    // Better approach:
                }
            };

            // Simplified socket handling
            getSocket().then(socket => {
                socketInstance = socket;
                if (socketInstance) {
                    socketInstance.on('new_lab_order', () => setActiveTestCount(p => p + 1));
                }
            });
        }

        return () => {
            document.removeEventListener('visibilitychange', () => { });
            window.removeEventListener('focus', () => { });
            if (socketInstance) {
                socketInstance.off('new_lab_order');
            }
        };
    }, [isAuthenticated, user]);

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

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!isAuthenticated || user?.role !== 'lab') return null;

    return (
        <div className="flex min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>
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
                fixed left-0 top-0 h-full w-64 max-w-[256px] text-(--secondary-color) flex flex-col z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                shadow-xl
            `}
                style={{
                    backgroundColor: 'var(--sidebar-bg)'
                }}
            >
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-6"
                >
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text tracking-wide">
                            Lab Panel
                        </h1>
                    </div>
                </div>

                {/* Scrollable menu area */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 hide-scrollbar">
                    {labMenu.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    router.push(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left relative overflow-hidden
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01]'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                                )}
                                <item.icon
                                    size={22}
                                    className={`relative z-10 ${isActive ? 'drop-shadow-sm' : 'group-hover:scale-110 transition-transform'}`}
                                />
                                <span className="relative z-10">{item.label}</span>
                                {item.hasBadge && activeTestCount > 0 && (
                                    <span className="ml-auto relative z-10 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50 animate-pulse">
                                        {activeTestCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer (Settings + Logout) */}
                <div className="p-4 space-y-2 mt-auto border-t border-gray-200 dark:border-gray-700">
                    <button
                        // onClick={() => router.push('/lab/settings')}
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01]"
                    >
                        <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span>Settings</span>
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 transition-all duration-300 hover:scale-[1.01]"
                    >
                        <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all duration-300 w-full max-w-full overflow-x-hidden">
                {/* Navbar */}
                <header className="h-18 flex items-center justify-between px-6 shadow-lg backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50"
                    style={{
                        backgroundColor: 'var(--navbar-bg)'
                    }}
                >
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ color: 'var(--text-color)' }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex-1 max-w-md mx-4">
                        {/* Search bar if needed */}
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {/* User Info Badge */}
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {labUser.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{labUser.name}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lab Technician</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="group p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl transition-all hover:scale-110"
                            title="Sign Out"
                        >
                            <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
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