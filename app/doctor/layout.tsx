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
            { icon: <Settings size={20} />, label: "Support & Feedback", path: "/doctor/support" },
        ]
    }
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isLoading } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Doctor Portal...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 z-40
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                        Doctor Portal
                    </h1>
                </div>

                <nav className="p-4 space-y-8 h-[calc(100vh-64px)] overflow-y-auto">
                    {doctorMenu.map((group) => (
                        <div key={group.group} className="space-y-2">
                            <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
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
                                                    ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                                                    : 'text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600'}
                                            `}
                                        >
                                            <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500'} transition-colors`}>
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
                                placeholder="Search records, patients..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111]"></span>
                        </button>
                        
                        <div className="h-8 w-px bg-gray-200 dark:border-gray-800 mx-2"></div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Dr. {user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Doctor</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow">
                                    {user?.name?.charAt(0)}
                                </div>
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-40 overflow-hidden bg-white dark:bg-[#111]">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">Dr. {user?.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Medical Doctor</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <button
                                                onClick={() => { router.push('/doctor/profile'); setIsProfileDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <User size={18} className="text-emerald-600" />
                                                <span>My Profile</span>
                                            </button>
                                            <button
                                                onClick={() => { logout(); setIsProfileDropdownOpen(false); }}
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
