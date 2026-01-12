"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import QuickNotesInput from './QuickNotesInput';
import DoctorNotesList from './DoctorNotesList';
import AppointmentsQueueDynamic from './AppointmentsQueueDynamic';
import DoctorStatsCards from './DoctorStatsCards';
import DoctorCalendar from './DoctorCalendar';
import CurrentSessionCard from './CurrentSessionCard';
import EstimatedWaitCard from './EstimatedWaitCard';

interface DoctorDashboardContainerProps {
    doctorName: string;
    stats: any;
    chartData: any[];
    initialNotes: any[];
}

export default function DoctorDashboardContainer({
    doctorName,
    stats,
    chartData,
    initialNotes
}: DoctorDashboardContainerProps) {
    const router = useRouter();
    const [queueStats, setQueueStats] = useState({
        queueCount: 0,
        totalAppointments: 0,
        completedCount: 0,
        estimatedMinutes: 0,
        showQueue: true,
        nextAppointmentId: null as string | null,
        currentAppointmentId: null as string | null
    });

    const handleNextPatient = () => {
        if (queueStats.nextAppointmentId) {
            toast.success('Navigating to next patient...');
            router.push(`/doctor/appointment/${queueStats.nextAppointmentId}`);
        } else {
            toast.error('No patients in queue');
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-border-theme">
                <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                        Welcome, {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
                    </h1>
                    <p className="text-muted text-xs sm:text-sm mt-1">Your dashboard and quick actions</p>
                </div>
                <button
                    onClick={handleNextPatient}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-theme text-primary-theme-foreground text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <User size={16} /> Next Patient
                </button>
            </div>

            {/* Stats Cards */}
            <DoctorStatsCards stats={stats} />

            {/* Queue & Session Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {/* Appointments Queue */}
                <div className="h-[500px] sm:h-[550px] md:h-[600px]">
                    <AppointmentsQueueDynamic onStatsChange={setQueueStats as any} />
                </div>

                {/* Session & Calendar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 h-[500px] sm:h-[550px] md:h-[600px]">
                    {/* Current Session */}
                    <div className="h-full">
                        <CurrentSessionCard 
                            currentAppointmentId={queueStats.currentAppointmentId}
                        />
                    </div>

                    {/* Calendar */}
                    <div className="h-full">
                        <DoctorCalendar />
                    </div>
                </div>
            </div>

            {/* Notes & Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left: Quick Notes & Stats */}
                <div className="space-y-4 md:space-y-6">
                    {/* Quick Notes */}
                    <QuickNotesInput />
                    
                    {/* Today Summary */}
                    <div className="bg-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-border-theme shadow-sm">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Calendar className="text-white" size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-foreground">Today Summary</h3>
                                    <p className="text-[10px] sm:text-xs text-muted font-medium">Progress overview</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[9px] sm:text-[10px] font-bold rounded-full uppercase">Live</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3 sm:p-4 bg-secondary-theme rounded-lg sm:rounded-xl border border-border-theme">
                                <p className="text-[10px] sm:text-xs font-bold text-muted uppercase mb-1">Today's Total</p>
                                <p className="text-xl sm:text-2xl font-bold text-foreground">{queueStats.totalAppointments}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg sm:rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <p className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Completed</p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{queueStats.completedCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Estimated Wait */}
                    <EstimatedWaitCard 
                        queueCount={queueStats.queueCount}
                        showQueue={queueStats.showQueue}
                    />
                </div>

                {/* Right: My Notes */}
                <div>
                    <DoctorNotesList initialNotes={initialNotes} />
                </div>
            </div>
        </div>
    );
}
