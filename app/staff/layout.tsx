'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import Sidebar, { SidebarItem } from '@/components/slidebar/Sidebar';
import { LayoutDashboard, CalendarCheck, Calendar, Clock, Bell, User, ReceiptText, BookOpenCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const staffMenuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/staff' },
    { icon: Clock, label: 'Attendance', href: '/staff/attendance' },
    { icon: CalendarCheck, label: 'Leave & Absence', href: '/staff/leaves' },
    { icon: BookOpenCheck, label: 'My Schedule', href: '/staff/schedule' },
    { icon: Bell, label: 'Announcements', href: '/staff/announcements' },
    { icon: ReceiptText, label: 'Payroll & Salary', href: '/staff/payroll' },
    { icon: User, label: 'My Profile', href: '/staff/profile' },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // Basic state for demo

    const { user, logout } = useAuthStore();
    
    const staffUser = {
        name: user?.name || "Staff Member",
        role: "Staff",
        image: "" 
    };

    return (
        <div className={`flex min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                items={staffMenuItems}
                onLogout={logout}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64' /* Simple desktop persistence */}`}>

                {/* Navbar */}
                <Navbar
                    title="Staff Portal"
                    user={staffUser}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                    className="sticky top-0 z-30"
                />

                {/* Page Content */}
                <main className="p-6 flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
