export interface DoctorStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingReports: number;
  consultationsValue: number;
}

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  type: string; // 'Consultation', 'Follow-up'
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
}

export interface DoctorReport {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'Pending' | 'Ready';
  priority: 'Normal' | 'Urgent';
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  experience: string;
  availability: string;
  bio: string;
}
