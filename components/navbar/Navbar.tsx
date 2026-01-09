'use client';

import React from 'react';
import { Menu, Bell, Sun, Moon, User, Search, LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    /**
     * Header title or logo text
     */
    title?: string;
    /**
     * Callback when the menu (hamburger) button is clicked
     */
    onMenuClick?: () => void;
    /**
     * Current theme state (true for dark mode)
     */
    isDarkMode?: boolean;
    /**
     * Function to toggle theme
     */
    onThemeToggle?: () => void;
    /**
     * User profile information
     */
    user?: {
        name: string;
        role: string;
        image?: string;
    };
    /**
     * Custom actions to render on the right side (e.g. Bell icon)
     * If not provided, a default Bell icon will be shown
     */
    actions?: React.ReactNode;
    /**
     * Search handler. If provided, a search bar will be shown.
     */
    onSearch?: (query: string) => void;
    /**
     * Callback for logout action
     */
    onLogout?: () => void;
    /**
     * Additional class names
     */
    className?: string;
}

/**
 * Navbar Component
 * 
 * A responsive navigation bar containing:
 * - Logo/Title (Left aligned)
 * - Mobile Menu Toggle
 * - Search Bar (Hidden on small screens)
 * - Right-aligned controls: Theme Toggle, Notifications, Profile
 */
import NotificationCenter from './NotificationCenter';
import LogoutModal from '../auth/LogoutModal';

export default function Navbar({
    title = "MScurechain",
    onMenuClick,
    isDarkMode = false,
    onThemeToggle,
    user: propUser,
    actions,
    onSearch,
    onLogout,
    className = ""
}: NavbarProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout, user: authUser } = useAuthStore();
    const router = useRouter();

    const user = propUser || (authUser ? {
        name: authUser.name,
        role: authUser.role,
        image: (authUser as any).image || ""
    } : undefined);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProfileOpen(false);
        if (onLogout) {
            onLogout();
        }
    };
    return (
        <nav className={`w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50 ${className}`}>
            {/* Left Section: Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Logo / Brand Name */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 dark:shadow-none">
                        M
                    </div>
                    <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {title}
                    </span>
                </Link>
            </div>

            {/* Center Section: Search (Desktop only) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                {onSearch && (
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search protocol registry..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl focus:outline-none transition-all text-sm font-bold shadow-xs whitespace-nowrap"
                        />
                    </div>
                )}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Custom Actions */}
                {actions && <div className="flex items-center gap-2">{actions}</div>}

                {/* Notifications */}
                <NotificationCenter />

                {/* Theme Toggle */}
                <button
                    onClick={onThemeToggle}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Profile Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800 ml-2 group transition-all"
                    >
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                {user?.name || "User"}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                {user?.role || "Guest"}
                                <ChevronDown className={`w-3 h-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-xs group-hover:border-blue-500 transition-all flex items-center justify-center text-gray-400">
                            {user?.image ? (
                                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                            )}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden p-2 transform animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 mb-2 border-b border-gray-50 dark:border-gray-800">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Authenticated Node</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase">{user?.name}</p>
                            </div>

                            {user?.role?.toLowerCase() !== 'staff' && (
                                <Link
                                    href={`/${user?.role?.toLowerCase()}/profile`}
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all group"
                                >
                                    <UserCircle className="w-4 h-4 text-gray-400 group-hover:text-blue-600 font-black" />
                                    My Profile Protocol
                                </Link>
                            )}

                            <Link
                                href={`/${user?.role?.toLowerCase()}/settings`}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all group"
                            >
                                <Settings className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                                Configuration
                            </Link>

                            <div className="my-2 border-t border-gray-50 dark:border-gray-800"></div>

                            <button
                                onClick={handleLogoutClick}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all group"
                            >
                                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                Terminate Session
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </nav>
    );
}
