import type { Hospital } from './admin';

export interface HospitalAdminDashboard {
  hospital: Hospital;
  stats: {
    totalDoctors: number;
    totalHelpdesk: number;
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
  };
}

export interface HospitalAdminPatient {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  lastAppointment: Date;
  totalAppointments: number;
}

export interface AttendanceRecord {
  _id: string;
  staff: {
    _id: string;
    employeeId?: string;
    user: {
      name: string;
      email: string;
    };
    designation: string;
  };
  date: string;
  checkIn: {
    time: string;
    method?: string;
    location?: string;
  };
  checkOut: {
    time: string;
    method?: string;
    location?: string;
  };
  workingHours: number;
  workHours?: number; // Alias for UI
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  notes?: string;
  location?: { name: string }; // Optional location object for UI
}

export interface AttendanceStats {
  totalStaff: number;
  today: {
    present: number;
    absent: number;
    late: number;
    onLeave: number;
  };
  averageAttendance: number;
}