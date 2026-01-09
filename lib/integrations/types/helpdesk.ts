// Helpdesk Dashboard Types
export interface HelpdeskDashboardStats {
  totalDoctors: number;
  totalPatients: number;
  todayPatients: number;
  pendingAppointments: number;
  activeTransits: number;
  emergencyCases: number;
}

export interface RecentPatient {
  id: string;
  name: string;
  gender: string;
  age: string | number;
  contact: string;
  registeredAt: Date | string;
}

export interface HelpdeskAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  date: Date | string;
  type: string;
  status: string;
}

export interface HelpdeskDashboard {
  stats: HelpdeskDashboardStats;
  recentPatients: RecentPatient[];
  appointments: HelpdeskAppointment[];
}

// Helpdesk Profile
export interface HelpdeskProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  hospital: {
    _id: string;
    name: string;
  };
}

// Doctor for helpdesk view
export interface HelpdeskDoctor {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  specialties: string[];
  qualifications: string[];
  avatar?: string;
  availability?: any[];
}

// Patient Registration
export interface PatientRegistrationRequest {
  name: string;
  mobile: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dob: string;
  address: string;
  emergencyContact: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string;
  vitals?: {
    height?: string;
    weight?: string;
    bp?: string;
    pulse?: string;
    sugar?: string;
    spo2?: string;
    temperature?: string;
  };
}

export interface PatientRegistrationResponse {
  success: boolean;
  message: string;
  patient: {
    id: string;
    mrn: string;
    name: string;
  };
}
