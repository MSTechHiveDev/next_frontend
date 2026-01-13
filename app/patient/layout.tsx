'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, User } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/auth/LogoutModal';

const patientMenuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/patient' },
    { icon: FileText, label: 'Medical Records', href: '/patient#medical-records' },
    // Add more patient-specific routes here as they are developed
];


export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { user, logout, isAuthenticated, isInitialized, isLoading, checkAuth } = useAuthStore();
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (user?.role !== 'patient') {
                const routeMap: Record<string, string> = {
                    'staff': '/staff',
                    'doctor': '/doctor',
                    'hospital-admin': '/hospital-admin',
                    'lab': '/lab/dashboard',
                    'pharma-owner': '/pharmacy/dashboard',
                    'pharmacy': '/pharmacy/dashboard',
                    'super-admin': '/admin',
                    'admin': '/admin',
                    'helpdesk': '/helpdesk'
                };
                router.push(routeMap[user?.role || ''] || '/auth/login');
            } else {
                // If authenticated as patient, refresh to ensure Server Components 
                // get the latest cookies synced by checkAuth
                router.refresh();
            }
        }
    }, [isInitialized, isAuthenticated, user?.role, router]);

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
                        <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-center">Patient Portal</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-1">Synchronizing Health Node</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'patient') return null;

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-[#0a0a0a] ${isDarkMode ? 'dark' : ''}`}>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                userName={user?.name}
            />
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                items={patientMenuItems}
                onLogout={() => setIsLogoutModalOpen(true)}
            />

            {/* Main Content Wrapper */}
            <div className="lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                {/* Navbar */}
                <Navbar
                    title="Patient Portal"
                    onMenuClick={() => setSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                    onLogout={() => setIsLogoutModalOpen(true)}
                    showProfileDropdown={false}
                    user={{
                        name: user?.name || 'Patient',
                        role: 'Patient',
                    }}
                />

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
