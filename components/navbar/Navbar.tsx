'use client';

import React from 'react';
import { Menu, Bell, Sun, Moon, User, Search } from 'lucide-react';
import Link from 'next/link';

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
export default function Navbar({
    title = "MScurechain",
    onMenuClick,
    isDarkMode = false,
    onThemeToggle,
    user,
    actions,
    onSearch,
    className = ""
}: NavbarProps) {
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
                    {/* You can replace this div with an <Image /> if you have a logo file */}
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        M
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                            placeholder="Search..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={onThemeToggle}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Custom Actions or Default Notifications */}
                {actions ? actions : (
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    </button>
                )}

                {/* Profile Dropdown Trigger */}
                <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.name || "User"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.role || "Guest"}
                        </span>
                    </div>
                    <button className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 ring-2 ring-transparent hover:ring-blue-500 transition-all">
                        {user?.image ? (
                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <User className="w-5 h-5" />
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}
