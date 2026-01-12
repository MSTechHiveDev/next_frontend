'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Pill, FlaskConical, FileCheck, Activity, Loader2 } from 'lucide-react';
import { patientService } from '@/lib/integrations/services/patient.service';
import AppointmentsSection from './AppointmentsSection';
import PrescriptionsSection from './PrescriptionsSection';
import LabRecordsSection from './LabRecordsSection';
import HelpdeskPrescriptionsSection from './HelpdeskPrescriptionsSection';

type TabType = 'appointments' | 'prescriptions' | 'lab-records' | 'helpdesk';

interface DashboardData {
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
            label: 'Appointments',
            icon: Calendar,
            count: dashboardData?.appointments.count || 0,
            color: 'blue',
        },
        {
            id: 'prescriptions' as TabType,
            label: 'Prescriptions',
            icon: Pill,
            count: dashboardData?.prescriptions.count || 0,
            color: 'green',
        },
        {
            id: 'lab-records' as TabType,
            label: 'Lab Records',
            icon: FlaskConical,
            count: dashboardData?.labRecords.count || 0,
            color: 'purple',
        },
        {
            id: 'helpdesk' as TabType,
            label: 'Helpdesk Bookings',
            icon: FileCheck,
            count: dashboardData?.helpdeskPrescriptions.count || 0,
            color: 'indigo',
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
            indigo: {
                active: 'bg-indigo-600 text-white',
                inactive: 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
                badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
            },
        };

        return isActive ? colors[color].active : colors[color].inactive;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your medical records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Unable to Load Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-8 h-8" />
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">
                        Medical Dashboard
                    </h1>
                </div>
                <p className="text-blue-100 text-sm font-medium">
                    Access your complete medical history and records
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-2 shadow-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${getTabColorClasses(tab.color, isActive)}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden md:inline">{tab.label}</span>
                                    <span className="md:hidden text-xs">{tab.label.split(' ')[0]}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : tab.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : tab.color === 'green' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : tab.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'appointments' && (
                    <AppointmentsSection appointments={dashboardData?.appointments.data || []} />
                )}
                {activeTab === 'prescriptions' && (
                    <PrescriptionsSection prescriptions={dashboardData?.prescriptions.data || []} />
                )}
                {activeTab === 'lab-records' && (
                    <LabRecordsSection labRecords={dashboardData?.labRecords.data || []} />
                )}
                {activeTab === 'helpdesk' && (
                    <HelpdeskPrescriptionsSection helpdeskItems={dashboardData?.helpdeskPrescriptions.data || []} />
                )}
            </div>
        </div>
    );
}
