'use client';

import React, { useState } from 'react';
import { LayoutDashboard, User } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

const patientMenuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/patient' },
    // Add more patient-specific routes here as they are developed
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // Local state for demo, ideally use a theme provider
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-[#0a0a0a] ${isDarkMode ? 'dark' : ''}`}>
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                items={patientMenuItems}
                onLogout={handleLogout}
            />

            {/* Main Content Wrapper */}
            <div className="lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                {/* Navbar */}
                <Navbar
                    title="Patient Portal"
                    onMenuClick={toggleSidebar}
                    isDarkMode={isDarkMode}
                    onThemeToggle={toggleTheme}
                    user={{
                        name: user?.name || 'Patient',
                        role: 'Patient',
                        // image: user?.avatar // Assuming avatar exists or undefined
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
