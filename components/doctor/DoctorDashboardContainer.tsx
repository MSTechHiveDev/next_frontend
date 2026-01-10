"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import DoctorDashboardCharts from './DoctorDashboardCharts';
import QuickNotesInput from './QuickNotesInput';
import DoctorNotesList from './DoctorNotesList';
import AppointmentsQueueDynamic from './AppointmentsQueueDynamic';
import DoctorQueueStats from './DoctorQueueStats';
import DoctorStatsCards from './DoctorStatsCards';

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
        nextAppointmentId: null as string | null
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card dark:bg-card p-6 rounded-2xl shadow-sm border border-border-theme dark:border-border-theme">
                <div>
                    <h1 className="text-2xl max-sm:text-[14px] font-bold text-foreground dark:text-foreground uppercase tracking-tighter">Welcome, {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</h1>
                    <p className="text-muted dark:text-muted text-sm mt-1 max-sm:text-[12px]">Here's your upcoming care and quick actions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleNextPatient}
                        className="px-5 py-2.5 bg-primary-theme text-primary-theme-foreground text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <User size={16} /> Next Patient
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <DoctorStatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Consultation Analysis Chart */}
                    <div className="bg-card dark:bg-card p-5 rounded-[2.5rem] shadow-sm border border-border-theme dark:border-border-theme">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-xl max-sm:text-[14px] font-black text-foreground dark:text-foreground">Consultation Flow Analysis</h3>
                            </div>
                            <div className="flex bg-secondary-theme dark:bg-secondary-theme p-1 rounded-xl">
                                <button className="px-4 py-1.5 bg-card dark:bg-card shadow-sm text-xs font-black rounded-lg cursor-pointer text-foreground">Weekly</button>
                                <button className="px-4 py-1.5 text-xs font-black text-muted cursor-pointer">Monthly</button>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <DoctorDashboardCharts type="area" data={chartData} />
                        </div>
                    </div>

                    {/* Quick Notes Input */}
                    <QuickNotesInput />

                    {/* Appointments Queue */}
                    <AppointmentsQueueDynamic onStatsChange={setQueueStats} />
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* My Notes */}
                    <DoctorNotesList initialNotes={initialNotes} />

                    {/* Today's Summary & Estimated Wait Stats */}
                    <DoctorQueueStats
                        queueCount={queueStats.queueCount}
                        showQueue={queueStats.showQueue}
                    />
                </div>
            </div>
        </div>
    );
}
