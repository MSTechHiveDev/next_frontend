'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Pill, FlaskConical, FileCheck, Activity, Loader2, UserCircle } from 'lucide-react';
import { patientService } from '@/lib/integrations/services/patient.service';
import AppointmentsSection from './AppointmentsSection';
import PrescriptionsSection from './PrescriptionsSection';
import LabRecordsSection from './LabRecordsSection';
import ProfileSection from './ProfileSection';

type TabType = 'appointments' | 'prescriptions' | 'lab-records' | 'profile';

interface DashboardData {
    profile: any;
    appointments: { count: number; data: any[] };
    prescriptions: { count: number; data: any[] };
    labRecords: { count: number; data: any[] };
    helpdeskPrescriptions: { count: number; data: any[] };
}

export default function PatientDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('appointments');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await patientService.getDashboardData();
            
            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                setError('Failed to load dashboard data');
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('An error occurred while loading your medical records');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        {
            id: 'appointments' as TabType,
            label: 'Visits',
            icon: Calendar,
            count: dashboardData?.appointments?.count || 0,
            color: 'blue',
        },
        {
            id: 'prescriptions' as TabType,
            label: 'Rx',
            icon: Pill,
            count: dashboardData?.prescriptions?.count || 0,
            color: 'green',
        },
        {
            id: 'lab-records' as TabType,
            label: 'Lab',
            icon: FlaskConical,
            count: dashboardData?.labRecords?.count || 0,
            color: 'purple',
        },
        {
            id: 'profile' as TabType,
            label: 'Profile',
            icon: UserCircle,
            count: dashboardData?.profile ? 1 : 0,
            color: 'orange',
        },
    ];

    const getTabColorClasses = (color: string, isActive: boolean) => {
        const colors: Record<string, { active: string; inactive: string; badge: string }> = {
            blue: {
                active: 'bg-blue-600 text-white',
                inactive: 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
            },
            green: {
                active: 'bg-green-600 text-white',
                inactive: 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20',
                badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
            },
            purple: {
                active: 'bg-purple-600 text-white',
                inactive: 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20',
                badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
            },
            orange: {
                active: 'bg-orange-600 text-white',
                inactive: 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20',
                badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
            },
        };

        return isActive ? colors[color].active : colors[color].inactive;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium tracking-tight">Loading Records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md p-6">
                    <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Access Error
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-950 dark:text-white uppercase tracking-tight italic flex items-center gap-3">
                        <div className="w-1.5 h-8 md:w-2 md:h-10 bg-blue-600 rounded-full hidden sm:block" />
                        Health <span className="text-blue-600">Records</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px] sm:text-xs mt-1 sm:mt-2 ml-0.5">
                        Your Personal Medical History
                    </p>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-sm self-start sm:self-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <UserCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                        <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">Signed In</p>
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight italic text-sm sm:text-base">
                            {dashboardData?.profile?.user?.name || 'Member'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Responsive Tabs - More Compact on Mobile */}
            <div className="sticky top-4 z-40">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-full p-1.5 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/10 flex overflow-x-auto no-scrollbar md:grid md:grid-cols-4 gap-1.5">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-none min-w-[100px] md:min-w-0 md:flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-102' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="hidden xs:inline">{tab.label}</span>
                                <span className="xs:hidden">{tab.id === 'appointments' ? 'Visits' : tab.id === 'lab-records' ? 'Labs' : tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px] sm:min-h-[600px] animate-in slide-in-from-bottom-4 fade-in duration-500 pb-10">
                {activeTab === 'profile' && (
                    <ProfileSection 
                        profile={dashboardData?.profile} 
                        appointments={dashboardData?.appointments?.data || []} 
                    />
                )}
                {activeTab === 'appointments' && (
                    <AppointmentsSection appointments={dashboardData?.appointments?.data || []} />
                )}
                {activeTab === 'prescriptions' && (
                    <PrescriptionsSection 
                        prescriptions={dashboardData?.prescriptions?.data || []} 
                        patientName={dashboardData?.profile?.user?.name}
                        patientEmail={dashboardData?.profile?.user?.email || dashboardData?.profile?.email}
                    />
                )}
                {activeTab === 'lab-records' && (
                    <LabRecordsSection 
                        labRecords={dashboardData?.labRecords?.data || []} 
                        patientName={dashboardData?.profile?.user?.name}
                        patientEmail={dashboardData?.profile?.user?.email || dashboardData?.profile?.email}
                    />
                )}
            </div>
        </div>
    );
}

