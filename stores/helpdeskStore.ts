import { create } from 'zustand';
import { helpdeskData } from "@/lib/integrations/data/helpdesk";

export interface Patient {
  id: string; // MRN
  name: string;
  age: number | string;
  gender: string;
  contact: string;
  registeredAt: string;
  // Detailed info
  dob?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  vitals?: any;
  history?: any;
  symptoms?: string[];
}

export interface Appointment {
  id: string;
  patientId: string; // MRN
  patientName: string;
  doctorName: string;
  doctorId: string;
  time: string;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

interface HelpdeskState {
  patients: Patient[];
  appointments: Appointment[];
  doctors: typeof helpdeskData.doctors;
  
  // Actions
  addPatient: (patient: Patient) => void;
  addAppointment: (appointment: Appointment) => void;
  getPatient: (id: string) => Patient | undefined;
  checkPatientExists: (mobile: string) => boolean;
  hospitalDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
}

export const useHelpdeskStore = create<HelpdeskState>((set, get) => ({
  patients: helpdeskData.recentPatients,
  appointments: helpdeskData.upcomingAppointments.map(a => ({
    ...a, 
    status: 'Scheduled', 
    doctorId: '1',
    patientId: `MRN-${Math.floor(Math.random() * 90000)}` 
  })),
  doctors: helpdeskData.doctors,
  
  hospitalDetails: {
    name: "CureChain Medical Center",
    address: "123 Health Avenue, Medicity, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "contact@curechain.health"
  },

  addPatient: (patient) => set((state) => ({ 
    patients: [patient, ...state.patients] 
  })),

  addAppointment: (appointment) => set((state) => ({ 
    appointments: [...state.appointments, appointment] 
  })),

  getPatient: (id) => get().patients.find(p => p.id === id),
  
  checkPatientExists: (mobile) => {
    return get().patients.some(p => p.contact === mobile);
  },
}));
