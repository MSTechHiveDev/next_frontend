import React from 'react';
import {
   getDoctorDashboardAction,
   getDoctorProfileAction,
   getQuickNotesAction,
   getDoctorWeeklyStatsAction
} from '@/lib/integrations';
import DoctorDashboardContainer from '@/components/doctor/DoctorDashboardContainer';

export default async function DoctorDashboard() {
   // Parallel data fetching
   const [dashboardRes, meRes, notesRes, statsRes] = await Promise.all([
      getDoctorDashboardAction(),
      getDoctorProfileAction(),
      getQuickNotesAction(),
      getDoctorWeeklyStatsAction()
   ]);

   const dashboard = dashboardRes.success && dashboardRes.data ? dashboardRes.data : null;
   const doctorName = meRes.success && meRes.data?.user?.name ? meRes.data.user.name : 'Doctor';

   // Extract basic stats for cards
   const stats = dashboard?.stats || {
      totalPatients: 0,
      appointmentsToday: 0,
      totalPendingQueue: 0,
      pendingReports: 0,
      consultationsValue: 0
   };

   // Process Chart Data
   let chartData: any[] = [];
   if (statsRes.success && statsRes.data && Array.isArray(statsRes.data.days)) {
      chartData = statsRes.data.days.map((day: any) => ({
         name: day.dayName ? day.dayName.substring(0, 3) : 'N/A',
         count: day.dailyTotal || 0
      }));
   }

   const notes = notesRes.success && notesRes.data ? notesRes.data : [];

   return (
      <div className="pb-20 animate-in fade-in duration-500">
         {/* Main Dashboard Layout Container (Includes Header, Stats, and Grid) */}
         <DoctorDashboardContainer
            doctorName={doctorName}
            stats={stats}
            chartData={chartData}
            initialNotes={notes}
         />
      </div>
   );
}