'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import { Settings, LogOut, X } from "lucide-react";

const adminMenu = [
    { icon: "/dashboard.png", label: "Dashboard", path: "/admin" },
    { icon: "/assets/user.png", label: "All Users", path: "/admin/users" },
    { icon: "/assets/doctor.png", label: "Hospitals", path: "/admin/hospitals" },
    { icon: "/assets/doctor.png", label: "Doctors", path: "/admin/doctors" },
    { icon: "/assets/user.png", label: "Patients", path: "/admin/patients" },
    { icon: "/assets/user.png", label: "Front Desk", path: "/admin/helpdesks" },
    { icon: "/assets/user.png", label: "Create Admin", path: "/admin/create-admin" },
    { icon: "/assets/user.png", label: "Admins", path: "/admin/admins" },
    { icon: "/assets/doctor.png", label: "Create Doctor", path: "/admin/create-doctor" },
    { icon: "/assets/user.png", label: "Create HelpDesk", path: "/admin/create-helpdesk" },
    { icon: "/assets/doctor.png", label: "Create Hospital", path: "/admin/create-hospital" },
    { icon: "/assets/user.png", label: "Assign Doctor", path: "/admin/assign-doctor" },
    { icon: "/assets/mail.png", label: "Broadcast", path: "/admin/broadcast" },
    { icon: "/assets/reports.png", label: "Audit Logs", path: "/admin/audits" },
    { icon: "/assets/help.png", label: "Support & Feedback", path: "/admin/support" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isLoading } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchPlaceholder, setSearchPlaceholder] = useState("Search...");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const adminUser = user || {
        name: "Super Admin",
        role: "Super Admin",
        avatar: null,
    };

    // Auth guard - check authentication on mount
    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    // Redirect to login if not authenticated after loading completes
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--bg-color)">
                <div className="text-(--text-color) text-lg">Loading...</div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--bg-color)">
                <div className="text-(--text-color) text-lg">Redirecting to login...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
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
                fixed left-0 top-0 h-full w-54 text-(--secondary-color) flex flex-col z-40
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
                            Admin Panel
                        </h1>
                    </div>
                </div>

                {/* Scrollable menu area */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 hide-scrollbar">
                    {adminMenu.map((item) => {
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
                                {item.icon && (
                                    <img
                                        src={item.icon}
                                        alt={item.label}
                                        className="w-5 h-5 object-contain"
                                    />
                                )}
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Footer (Settings + Logout) */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={() => router.push('/admin/settings')}
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
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-54 min-h-screen transition-all duration-300 w-full max-w-full overflow-x-hidden">
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
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-color)',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <span style={{ color: 'var(--text-color)' }}>{adminUser.name}</span>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout
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

export default AdminLayout;