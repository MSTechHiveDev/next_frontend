import { Suspense } from "react";
import { getAttendanceAction, getAttendanceStatsAction } from "@/lib/integrations";
import AttendanceClient from "./AttendanceClient";
import { PageHeader, Card } from "@/components/admin";
import { Users, Calendar } from "lucide-react";

async function AttendanceData() {
  try {
    // Fetch initial data on the server for better performance
    const today = new Date().toISOString().split('T')[0];
    const [attendanceResponse, statsResponse] = await Promise.all([
      getAttendanceAction({ date: today }),
      getAttendanceStatsAction()
    ]);

    return (
      <AttendanceClient 
        initialAttendance={attendanceResponse.attendance || []}
        initialStats={statsResponse.stats}
      />
    );
  } catch (error) {
    console.error("Failed to fetch initial attendance data:", error);
    
    // Return error state
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <PageHeader
          icon={<Users className="text-blue-500" />}
          title="Attendance Tracker"
          subtitle="Monitor and manage staff attendance"
        />
        
        <Card padding="p-12">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-red-600">
              Failed to load attendance data
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the attendance information. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </Card>
      </div>
    );
  }
}

function AttendanceLoading() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        icon={<Users className="text-blue-500" />}
        title="Attendance Tracker"
        subtitle="Monitor and manage staff attendance"
      />
      
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    </div>
  );
}

export default function HospitalAdminAttendancePage() {
  return (
    <Suspense fallback={<AttendanceLoading />}>
      <AttendanceData />
    </Suspense>
  );
}
