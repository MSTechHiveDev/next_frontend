export interface Hospital {
  _id: string;
  hospitalId?: string; // Human readable ID if available
  name: string;
  email: string;
  phone: string;
  website?: string;
  establishedYear?: number;
  address: string;
  pincode: string;
  location?: {
    lat: number | string;
    lng: number | string;
  };
  totalBeds?: number;
  numberOfBeds?: number; // Compatibility
  icuBeds?: number;
  ICUBeds?: number; // Compatibility
  numDoctors?: number;
  numberOfDoctors?: number; // Compatibility
  ambulanceAvailable?: boolean;
  ambulanceAvailability?: boolean; // Compatibility
  specialties: string[];
  specialities?: string[]; // Backend alias
  services: string[];
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'suspended';
  operatingHours?: string;
  rating?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  doctorId?: string;
  name: string;
  email: string;
  mobile: string;
  role: 'doctor';
  gender?: string;
  hospital?: string | Hospital | any;
  specialties: string[];
  qualifications?: string[];
  qualification?: string; // Legacy field
  experienceStartDate?: string;
  experienceStart?: string; // Legacy field
  consultationFee?: number;
  bio?: string;
  profilePic?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  hospitals?: Array<{
    hospital: Hospital;
    specialties: string[];
    consultationFee: number;
  }>;
}

export interface Patient {
  _id: string;
  patientProfileId?: string;
  name: string;
  email: string;
  mobile: string;
  role: 'patient';
  dob?: string;
  gender?: string;
  allergies?: string;
  conditions?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Helpdesk {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'helpdesk';
  hospital?: string | Hospital;
  hospitalId?: string;
  hospitalName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  details: string;
  timestamp: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
  type: 'bug' | 'complaint' | 'feedback' | 'other';
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalHospitals: number;
  totalDoctors: number;
  totalPatients: number;
  totalAdmins: number;
  totalHelpDesks: number;
  totalHelpdesks?: number; // compat
  recentUsers?: any[];
  recentRegistrations?: any[];
  activityStats?: Array<{
    _id: string;
    count: number;
  }>;
  hospitalsByStatus?: {
    active: number;
    inactive: number;
    pending: number;
  };
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  mobile: string;
  password?: string;
}

export interface CreateDoctorRequest extends CreateAdminRequest {
  gender: string;
  hospitalId?: string;
  hospital?: string; // legacy
  specialties: string[];
  qualifications?: string[];
  qualification?: string; // legacy
  experienceStart: string;
  experienceStartDate?: string; // legacy
  consultationFee: number;
  bio: string;
  profilePic?: string;
  assignHospitals?: Array<{
    hospitalId: string;
    specialties: string[];
    consultationFee: number;
  }>;
}

export interface CreateHelpdeskRequest extends CreateAdminRequest {
  hospitalId: string;
  hospital?: string; // legacy
}

export interface CreateHospitalRequest {
  hospitalId?: string; // Manual override
  name: string;
  email: string;
  phone: string;
  website?: string;
  establishedYear?: string | number;
  address: string;
  pincode: string;
  location?: { lat: string | number; lng: string | number };
  lat?: number; // legacy
  lng?: number; // legacy
  numberOfBeds?: number;
  totalBeds?: number; // legacy
  ICUBeds?: number;
  icuBeds?: number; // legacy
  numberOfDoctors?: number;
  numDoctors?: number; // legacy
  ambulanceAvailability?: boolean;
  ambulanceAvailable?: boolean; // legacy
  specialities?: string[];
  specialties?: string[]; // frontend compatibility
  services: string[];
  operatingHours?: string;
  rating?: string;
}

export interface AssignDoctorRequest {
  hospitalId: string;
  doctorProfileId: string;
  doctorId?: string; // legacy support
  specialties: string[];
  consultationFee: number;
}

export interface BroadcastRequest {
  title: string;
  body: string;
}
