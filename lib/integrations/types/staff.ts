// Staff Dashboard Types
export interface StaffDashboard {
  staff: StaffProfile;
  stats: StaffStats;
  todayAttendance: TodayAttendance | null;
}

export interface StaffProfile {
  _id: string;
  staffProfileId?: string; // Optional field for socket room identification
  user: {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
  };
  hospital: {
    _id: string;
    name: string;
    code: string;
  };
  designation: string;
  department?: string;
  employeeId?: string;
  joiningDate: string;
  isActive: boolean;
  shift?: any;
  workingHours?: {
    start: string;
    end: string;
  };
  weeklyOff?: string[];
  employmentType?: string;
  status?: string;
  resolvedShift?: {
    name: string;
    startTime: string;
    endTime: string;
    shiftId: string;
  };
}

export interface StaffStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  onLeaveDays: number;
  halfDays: number;
  averageHours: string;
  averageCheckIn: string;
  averageCheckOut: string;
  onTimePercentage: number;
  pendingLeaves: number;
  leaveTypeBreakdown: Record<string, number>;
}

export interface TodayAttendance {
  _id: string;
  staff: string;
  date: string;
  checkIn?: {
    time: string;
    location?: string;
  };
  checkOut?: {
    time: string;
    location?: string;
  };
  breaks: Array<{
    start: string;
    end?: string;
  }>;
  workingHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  notes?: string;
}

export interface AttendanceHistory {
  _id: string;
  date: string;
  checkIn: {
    time: string;
    location?: string;
  };
  checkOut?: {
    time: string;
    location?: string;
  };
  workingHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  notes?: string;
}

export interface CheckInRequest {
  location?: string;
}

export interface CheckOutRequest {
  location?: string;
}

// Leave Management Types
export interface LeaveRequest {
  _id: string;
  staff: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
    designation: string;
  };
  leaveType: 'sick' | 'casual' | 'earned' | 'maternity' | 'paternity' | 'unpaid' | 'emergency' | 'other';
  startDate: string;
  endDate: string;
  duration: number; // in days
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  appliedOn?: string;
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedOn?: string;
  reviewNotes?: string;
}

export interface CreateLeaveRequest {
  leaveType: 'sick' | 'casual' | 'earned' | 'maternity' | 'paternity' | 'unpaid' | 'emergency' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveBalance {
  casual: number;
  totalCasual: number;
  sick: number;
  totalSick: number;
  emergency: number;
  totalEmergency: number;
  other: number;
}
