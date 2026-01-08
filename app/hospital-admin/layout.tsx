'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/stores/authStore';
import { 
  Settings, 
  LogOut, 
  X, 
  Building2, 
  Users, 
  Stethoscope, 
  Headphones, 
  UserCheck, 
  Pill, 
  FlaskConical, 
  User, 
  Calendar,
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard
} from "lucide-react";
import { ThemeToggle } from '@/components/ThemeToggle';

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  subItems?: { label: string; path: string }[];
}

const hospitalAdminMenu: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/hospital-admin" },
    { 
      icon: ClipboardCheck, 
      label: "Attendance Tracker", 
      subItems: [
        { label: "Live Overview", path: "/hospital-admin/attendance/overview" },
        { label: "Attendance Logs", path: "/hospital-admin/attendance/logs" },
        { label: "Shift Management", path: "/hospital-admin/attendance/schedules" },
      ]
    },
    { icon: Stethoscope, label: "Medical Staff", path: "/hospital-admin/doctors" },
    { icon: Headphones, label: "Helpdesk Support", path: "/hospital-admin/helpdesks" },
    { icon: Users, label: "Patient Registry", path: "/hospital-admin/patients" },
    { 
      icon: UserCheck, 
      label: "Workforce Control", 
      subItems: [
        { label: "Personnel List", path: "/hospital-admin/staff" },
        { label: "Leave Requests", path: "/hospital-admin/leaves" },
        { label: "Payroll Matrix", path: "/hospital-admin/payroll" },
      ]
    },
    { icon: Bell, label: "Notice Board", path: "/hospital-admin/announcements" },
    { icon: Pill, label: "Pharmacy Unit", path: "/hospital-admin/pharma" },
    { icon: FlaskConical, label: "Diagnostics Lab", path: "/hospital-admin/labs" },
];

const HospitalAdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated, checkAuth, isInitialized } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchPlaceholder, setSearchPlaceholder] = useState("Search...");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
      "Attendance Tracker": true
    });

    const toggleMenu = (label: string) => {
      setExpandedMenus(prev => ({
        ...prev,
        [label]: !prev[label]
      }));
    };

    const hospitalAdminUser = user || {
        name: "Hospital Admin",
        role: "hospital-admin",
        avatar: null,
    };

    // Auth guard - check authentication on mount
    useEffect(() => {
        useAuthStore.getState().initEvents();
        checkAuth();
    }, []);

    // Redirect to login if not authenticated or wrong role
    useEffect(() => {
        if (isInitialized) {
            if (!isAuthenticated) {
                router.push('/auth/login');
            } else if (user?.role !== 'hospital-admin') {
                router.push('/auth/login');
            }
        }
    }, [isAuthenticated, isInitialized, user?.role, router]);

    // Show loading while checking auth
    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--bg-color)">
                <div className="text-(--text-color) text-lg">Loading...</div>
            </div>
        );
    }

    // Don't render if not authenticated or wrong role
    if (!isAuthenticated || user?.role !== 'hospital-admin') {
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
                <div className="h-20 flex items-center justify-between px-6 border-b"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                            <Building2 className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black bg-linear-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text tracking-tight uppercase">
                                MS CureChain
                            </h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable menu area */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 hide-scrollbar">
                    {hospitalAdminMenu.map((item) => {
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isExpanded = expandedMenus[item.label];
                        const isActive = item.path ? pathname === item.path : item.subItems?.some(s => pathname === s.path);
                        const IconComponent = item.icon;
                        
                        return (
                          <div key={item.label} className="space-y-1">
                            <button
                                onClick={() => {
                                    if (hasSubItems) {
                                      toggleMenu(item.label);
                                    } else if (item.path) {
                                      router.push(item.path);
                                      setIsSidebarOpen(false);
                                    }
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 w-full text-left group
                                    ${isActive && !hasSubItems
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                  <IconComponent size={20} className={isActive ? 'text-blue-100' : 'text-gray-400 group-hover:text-blue-500'} />
                                  {item.label}
                                </div>
                                {hasSubItems && (
                                  isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                )}
                            </button>

                            {/* Sub Items */}
                            {hasSubItems && isExpanded && (
                              <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {item.subItems?.map(sub => (
                                  <button
                                    key={sub.path}
                                    onClick={() => {
                                      router.push(sub.path);
                                      setIsSidebarOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-all
                                      ${pathname === sub.path 
                                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                        : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                      }`}
                                  >
                                    {sub.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all duration-300 w-full max-w-full overflow-x-hidden">
                {/* Navbar */}
                <header className="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-30"
                    style={{
                        backgroundColor: 'var(--navbar-bg)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        style={{ color: 'var(--text-color)' }}
                    >
                        ☰
                    </button>
                    <div className="flex-1 max-w-md mx-4 hidden md:block">
                        <div className="relative group">
                          <input
                              type="text"
                              placeholder={searchPlaceholder}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full px-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              style={{
                                  backgroundColor: 'var(--card-bg)',
                                  color: 'var(--text-color)',
                                  border: '1px solid var(--border-color)'
                              }}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            <LayoutDashboard size={18} />
                          </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                          </button>
                          <ThemeToggle />
                        </div>
                        
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                        
                        <div className="relative">
                        <button
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity p-1 pr-3 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                        >
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 dark:shadow-none">
                                {hospitalAdminUser.name?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                                    {hospitalAdminUser.name}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Administrator</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                />
                                
                                <div
                                    className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl border z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                    style={{
                                        backgroundColor: 'var(--card-bg)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                >
                                    {/* User Info Header */}
                                    <div className="p-5 border-b bg-gray-50/50 dark:bg-gray-800/50" style={{ borderColor: 'var(--border-color)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                                {hospitalAdminUser.name?.charAt(0).toUpperCase() || "A"}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white" style={{ color: 'var(--text-color)' }}>
                                                    {hospitalAdminUser.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Hospital Admin</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                router.push('/hospital-admin/profile');
                                                setIsProfileDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl group"
                                        >
                                            <User size={18} className="text-gray-400 group-hover:text-blue-500" />
                                            <span>My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/hospital-admin/settings');
                                                setIsProfileDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl group"
                                        >
                                            <Settings size={18} className="text-gray-400 group-hover:text-blue-500" />
                                            <span>Settings</span>
                                        </button>
                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2"></div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsProfileDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all rounded-xl"
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

                <main className="p-6 max-[600px]:p-4 flex-1 overflow-y-auto bg-gray-50/30 dark:bg-transparent"
                    style={{ backgroundColor: 'var(--bg-color)' }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default HospitalAdminLayout;


