export const helpdeskData = {
  stats: {
    todayPatients: 45,
    pendingAppointments: 12,
    activeTransits: 5,
    emergencyCases: 2,
  },
  recentPatients: [
    { id: '1', name: 'John Doe', age: 45, gender: 'Male', contact: '9876543210', registeredAt: '2026-01-06T10:00:00Z' },
    { id: '2', name: 'Jane Smith', age: 32, gender: 'Female', contact: '8765432109', registeredAt: '2026-01-06T11:30:00Z' },
  ],
  upcomingAppointments: [
    { id: '1', patientName: 'Alice Johnson', doctorName: 'Dr. Smith', time: '2026-01-06T14:00:00Z', type: 'Consultation' },
    { id: '2', patientName: 'Bob Brown', doctorName: 'Dr. Williams', time: '2026-01-06T15:30:00Z', type: 'Follow-up' },
  ],
  doctors: [
    { id: '1', name: 'Dr. Smith', specialty: 'Cardiology', availability: 'Available' },
    { id: '2', name: 'Dr. Williams', specialty: 'Neurology', availability: 'On Leave' },
    { id: '3', name: 'Dr. Davis', specialty: 'Pediatrics', availability: 'Available' },
  ],
  transits: [
    { id: '1', patientName: 'Mark Wilson', from: 'Emergency', to: 'ICU', status: 'In Transit' },
    { id: '2', patientName: 'Sarah Connor', from: 'OT', to: 'Ward A', status: 'Completed' },
  ],
  transactions: [
    { id: '1', patientName: 'John Doe', amount: 1500, type: 'OPD Bill', status: 'Paid', date: '2026-01-06T10:15:00Z' },
    { id: '2', patientName: 'Jane Smith', amount: 5000, type: 'Lab Test', status: 'Pending', date: '2026-01-06T11:45:00Z' },
  ],
  emergencyRequests: [
    { id: '1', patientName: 'Patient X', condition: 'Critical - Accident', location: 'Near Main Gate', timestamp: '2026-01-06T15:20:00Z' },
  ]
};
