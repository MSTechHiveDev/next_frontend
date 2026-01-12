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
    Users,
    LifeBuoy,
    ChevronRight,
    Activity
} from "lucide-react";
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationCenter from "@/components/navbar/NotificationCenter";
import LogoutModal from "@/components/auth/LogoutModal";

const helpdeskMenu = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/helpdesk" },
    { icon: <UserPlus size={18} />, label: "Register Patient", path: "/helpdesk/patient-registration" },
    { icon: <Users size={18} />, label: "Patient List", path: "/helpdesk/patients" },
    { icon: <CalendarCheck size={18} />, label: "Book Appointment", path: "/helpdesk/appointment-booking" },
    { icon: <Stethoscope size={18} />, label: "Doctors List", path: "/helpdesk/doctors" },
    { icon: <Truck size={18} />, label: "Files & Receipts", path: "/helpdesk/transits" },
    { icon: <CreditCard size={18} />, label: "Transactions", path: "/helpdesk/transactions" },
    { icon: <AlertCircle size={18} />, label: "Emergency Cases", path: "/helpdesk/emergency-accept" },
    { icon: <LifeBuoy size={18} />, label: "Help & Support", path: "/helpdesk/support" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isLoading, isInitialized } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

    if (isLoading || !isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-teal-600/10 border-t-teal-600 rounded-full animate-spin"></div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] text-center">CureChain</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center mt-1">Starting System...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'helpdesk') return null;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-teal-100 selection:text-teal-900">
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                userName={user?.name}
            />
            
            {/* SIDEBAR */}
            <aside className={`
                fixed left-0 top-0 h-full w-72 bg-slate-900 z-50
                transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col shadow-2xl lg:shadow-none
            `}>
                <div className="h-20 flex items-center px-8 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                            <Activity size={18} className="text-white" strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white tracking-widest leading-none">CURECHAIN</h1>
                            <p className="text-[7px] font-bold text-teal-400 uppercase tracking-[0.3em] mt-1">HEALTHCARE PORTAL</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto p-2 text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                    <p className="px-4 text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-4 mt-2">Navigation</p>
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
                                    w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                                `}
                                aria-label={`Navigate to ${item.label}`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                                    ${isActive ? 'bg-white/20 text-white' : 'text-slate-500 group-hover:text-teal-400'}
                                `}>
                                    {item.icon}
                                </div>
                                <span className="flex-1 text-left">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 truncate">
                                <p className="text-[10px] font-bold text-white uppercase truncate">{user?.name}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Front Desk Staff</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                {/* TOP NAVBAR */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-600"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1 max-w-xl hidden md:block group">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <NotificationCenter />
                        </div>

                        <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors outline-none"
                                aria-expanded={isProfileDropdownOpen}
                                aria-haspopup="true"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{user?.name || "Staff Member"}</p>
                                    <p className="text-[8px] font-bold text-teal-600 uppercase tracking-widest mt-0.5">Helpdesk Portal</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm transition-transform">
                                    {user?.name?.charAt(0)}
                                </div>
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-4 w-72 rounded-[32px] shadow-2xl border border-slate-100 z-50 overflow-hidden bg-white animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-8 border-b border-slate-50">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-slate-200">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-black text-slate-900 uppercase tracking-tight">{user?.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Secure Staff Access</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-1">
                                            <button
                                                onClick={() => { router.push('/helpdesk/profile'); setIsProfileDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-2xl transition-all"
                                            >
                                                <User size={18} className="text-slate-300" />
                                                <span>My Profile</span>
                                            </button>
                                            <button
                                                onClick={() => { setIsLogoutModalOpen(true); setIsProfileDropdownOpen(false); }}
                                                className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
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

                <main className="flex-1 bg-[#F8FAFC]">
                    <div className="p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-md"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    );
}
