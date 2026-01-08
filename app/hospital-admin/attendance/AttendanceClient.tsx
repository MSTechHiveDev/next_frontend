"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  Download,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Card, Button } from "@/components/admin";
import { hospitalAdminService } from "@/lib/integrations";
import type { AttendanceRecord, AttendanceStats } from "@/lib/integrations";

const STATUS_CONFIG = {
  present: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Present" },
  absent: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Absent" },
  late: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50", label: "Late" },
  "half-day": { icon: Clock, color: "text-orange-500", bg: "bg-orange-50", label: "Half Day" },
  "on-leave": { icon: Calendar, color: "text-blue-500", bg: "bg-blue-50", label: "On Leave" }
};

interface AttendanceClientProps {
  initialAttendance: AttendanceRecord[];
  initialStats: AttendanceStats;
}

export default function AttendanceClient({ initialAttendance, initialStats }: AttendanceClientProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [stats, setStats] = useState<AttendanceStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (filterDate !== new Date().toISOString().split('T')[0] || filterStatus !== "") {
      fetchData();
    }
  }, [filterDate, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params: { date?: string; status?: string } = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;

      const [attendanceResponse, statsResponse] = await Promise.all([
        hospitalAdminService.getAttendance(params),
        hospitalAdminService.getAttendanceStats()
      ]);

      setAttendance(attendanceResponse.attendance || []);
      setStats(statsResponse.stats);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAttendance = async (id: string) => {
    try {
      toast("Edit feature coming soon");
    } catch (error: any) {
      toast.error("Failed to edit attendance record");
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      await hospitalAdminService.deleteAttendance(id);
      toast.success("Attendance record deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete attendance record");
    }
  };

  const handleExportReport = () => {
    toast("Export feature coming soon");
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.present;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} border`}>
        <Icon size={14} className={config.color} />
        <span className={config.color}>{config.label}</span>
      </div>
    );
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        icon={<Users className="text-blue-500" />}
        title="Attendance Tracker"
        subtitle="Monitor and manage staff attendance"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card padding="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--secondary-color)' }}>Total Staff</p>
              <h3 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{stats.totalStaff}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="text-blue-600" size={28} />
            </div>
          </div>
        </Card>

        <Card padding="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--secondary-color)' }}>Today Present</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.today?.present || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>
        </Card>

        <Card padding="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--secondary-color)' }}>Today Absent</p>
              <h3 className="text-3xl font-bold text-red-600">{stats.today?.absent || 0}</h3>
            </div>
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
              <XCircle className="text-red-600" size={28} />
            </div>
          </div>
        </Card>

        <Card padding="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--secondary-color)' }}>Avg Attendance</p>
              <h3 className="text-3xl font-bold text-purple-600">{stats.averageAttendance}%</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="text-purple-600" size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="p-4" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Filter className="text-gray-400" size={20} />
            
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--secondary-color)' }}>Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--secondary-color)' }}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
              >
                <option value="">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleExportReport}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Export Report
          </Button>
        </div>
      </Card>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-color)' }}>Updating attendance data...</p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <Card padding="p-0">
        <div className="overflow-x-auto">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                No attendance records found
              </h3>
              <p style={{ color: 'var(--secondary-color)' }}>
                No attendance data for the selected date and filters
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold" style={{ color: 'var(--secondary-color)' }}>
                    STAFF MEMBER
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold" style={{ color: 'var(--secondary-color)' }}>
                    CHECK IN
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold" style={{ color: 'var(--secondary-color)' }}>
                    CHECK OUT
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold" style={{ color: 'var(--secondary-color)' }}>
                    WORKING HOURS
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold" style={{ color: 'var(--secondary-color)' }}>
                    STATUS
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-semibold" style={{ color: 'var(--secondary-color)' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {record.staff?.user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-color)' }}>
                            {record.staff?.user?.name || 'Unknown'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--secondary-color)' }}>
                            {record.staff?.designation || 'Staff Member'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: 'var(--secondary-color)' }} />
                        <span style={{ color: 'var(--text-color)' }}>
                          {formatTime(record.checkIn?.time)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: 'var(--secondary-color)' }} />
                        <span style={{ color: 'var(--text-color)' }}>
                          {formatTime(record.checkOut?.time)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium" style={{ color: 'var(--text-color)' }}>
                        {formatDuration(record.workingHours)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditAttendance(record._id)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAttendance(record._id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}