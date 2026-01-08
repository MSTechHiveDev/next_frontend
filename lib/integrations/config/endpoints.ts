export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
};

export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  ATTENDANCE: '/attendance',
  ATTENDANCE_TODAY_STATUS: '/attendance/today-status',
  ATTENDANCE_CHECK_IN: '/attendance/check-in',
  ATTENDANCE_CHECK_OUT: '/attendance/check-out',
};

export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/analytics/dashboard',
  USERS: '/admin/users',
  DOCTORS: '/admin/users?role=doctor',
  PATIENTS: '/admin/users?role=patient',
  HELPDESKS: '/admin/users?role=helpdesk',
  ADMINS: '/admin/users?role=admin',
  HOSPITALS: '/admin/hospitals',
  CREATE_HOSPITAL: '/admin/create-hospital',
  UPDATE_HOSPITAL: (id: string) => `/admin/hospitals/${id}`,
  DELETE_HOSPITAL: (id: string) => `/admin/hospitals/${id}`,
  UPDATE_HOSPITAL_STATUS: (id: string) => `/admin/hospitals/${id}/status`,
  ASSIGN_DOCTOR: '/admin/hospitals/assign-doctor',
  ASSIGN_HELPDESK: '/admin/assign-helpdesk',
  CREATE_ADMIN: '/admin/create-admin',
  CREATE_HOSPITAL_ADMIN: '/admin/create-hospital-admin',
  CREATE_DOCTOR: '/admin/create-doctor',
  UPDATE_USER: (id: string) => `/admin/users/${id}`,
  DELETE_USER: (id: string, role?: string) => role ? `/admin/users/${id}?role=${role}` : `/admin/users/${id}`,
  DELETE_HELPDESK: (id: string) => `/admin/helpdesks/${id}`,
  BROADCAST: '/admin/broadcast',
  AUDITS: '/admin/audits',
  HOSPITAL_DETAILS: (id: string) => `/admin/hospitals/${id}/details`,
  HOSPITAL_DOCTORS: (id: string) => `/admin/hospitals/${id}/doctors`,
  SUPPORT_REQUESTS: '/support',
};

export const HOSPITAL_ADMIN_ENDPOINTS = {
  DASHBOARD: '/hospital-admin/dashboard',
  HOSPITAL: '/hospital-admin/hospital',
  DOCTORS: '/hospital-admin/doctors',
  CREATE_DOCTOR: '/hospital-admin/doctors',
  DOCTOR_DETAIL: (id: string) => `/hospital-admin/doctors/${id}`,
  UPDATE_DOCTOR: (id: string) => `/hospital-admin/doctors/${id}`,
  DELETE_DOCTOR: (id: string) => `/hospital-admin/doctors/${id}`,
  HELPDESKS: '/hospital-admin/helpdesks',
  CREATE_HELPDESK: '/hospital-admin/helpdesks',
  HELPDESK_DETAIL: (id: string) => `/hospital-admin/helpdesks/${id}`,
  PATIENTS: '/hospital-admin/patients',
  PHARMA: '/hospital-admin/pharma',
  LABS: '/hospital-admin/labs',
  STAFF: '/hospital-admin/staff',
  STAFF_DETAIL: (id: string) => `/hospital-admin/staff/${id}`,
  CREATE_STAFF: '/hospital-admin/staff',
  UPDATE_STAFF: (id: string) => `/hospital-admin/staff/${id}`,
  DELETE_STAFF: (id: string) => `/hospital-admin/staff/${id}`,
  ATTENDANCE: '/hospital-admin/attendance',
  ATTENDANCE_STATS: '/hospital-admin/attendance/stats',
  ATTENDANCE_DETAIL: (id: string) => `/hospital-admin/attendance/${id}`,
  UPDATE_ATTENDANCE: (id: string) => `/hospital-admin/attendance/${id}`,
  DELETE_ATTENDANCE: (id: string) => `/hospital-admin/attendance/${id}`,
  PAYROLL: '/hospital-admin/payroll',
  ANNOUNCEMENTS: '/announcements/hospital',
};

export const HELPDESK_ENDPOINTS = {
  DASHBOARD: '/helpdesk/dashboard',
  ME: '/helpdesk/me',
  DOCTORS: '/helpdesk/doctors',
  CREATE_DOCTOR: '/helpdesk/doctor',
  PATIENTS_SEARCH: '/helpdesk/patients/search',
  PATIENT_DETAILS: (id: string) => `/helpdesk/patients/${id}`,
  REGISTER_PATIENT: '/helpdesk/patients/register',
  APPOINTMENTS: '/helpdesk/appointments',
  APPOINTMENT_STATUS: (id: string) => `/helpdesk/appointments/${id}/status`,
};

export const BOOKING_ENDPOINTS = {
  AVAILABILITY: '/bookings/availability',
  BOOK: '/bookings/book',
  STATS: '/bookings/hospital-stats',
  MY_APPOINTMENTS: '/bookings/my-appointments',
};

export const DOCTOR_ENDPOINTS = {
  DASHBOARD: '/doctors/dashboard',
  PROFILE: '/doctors/me',
  MY_PATIENTS: '/doctors/my-patients',
  CALENDAR_STATS: '/doctors/calendar/stats',
  CALENDAR_APPOINTMENTS: '/doctors/calendar/appointments',
  QUICK_NOTES: '/doctors/quick-notes',
  START_NEXT: '/doctors/start-next',
};

export const STAFF_ENDPOINTS = {
  DASHBOARD: '/staff/dashboard',
  PROFILE: '/staff/me',
  
  // Attendance
  ATTENDANCE: '/staff/attendance',
  ATTENDANCE_HISTORY: '/staff/attendance/history',
  TODAY_STATUS: '/staff/attendance/today-status',
  CHECK_IN: '/staff/attendance/check-in',
  CHECK_OUT: '/staff/attendance/check-out',
  
  // Leave Management
  LEAVES: '/staff/leaves',
  LEAVE_DETAIL: (id: string) => `/staff/leaves/${id}`,
  CREATE_LEAVE: '/staff/leaves',
  UPDATE_LEAVE: (id: string) => `/staff/leaves/${id}`,
  DELETE_LEAVE: (id: string) => `/staff/leaves/${id}`,
  LEAVE_BALANCE: '/staff/leaves/balance',

  // Schedules
  SCHEDULE: '/staff/schedule',

  // Payroll
  PAYROLL: '/staff/payroll',

  // Announcements
  ANNOUNCEMENTS: '/staff/announcements',
};

export const COMMON_ENDPOINTS = {
  MY_ANNOUNCEMENTS: '/announcements/my',
};

// Legacy support to avoid breaking existing code immediately
export const endpoints = {
  auth: {
    login: AUTH_ENDPOINTS.LOGIN,
    register: AUTH_ENDPOINTS.REGISTER,
    sendOtp: AUTH_ENDPOINTS.SEND_OTP,
    verifyOtp: AUTH_ENDPOINTS.VERIFY_OTP,
    me: AUTH_ENDPOINTS.ME,
    logout: AUTH_ENDPOINTS.LOGOUT,
    refresh: AUTH_ENDPOINTS.REFRESH,
  },
  users: '/users',
  admin: {
    dashboard: ADMIN_ENDPOINTS.DASHBOARD,
    users: ADMIN_ENDPOINTS.USERS,
    hospitals: ADMIN_ENDPOINTS.HOSPITALS,
    doctors: ADMIN_ENDPOINTS.DOCTORS,
    patients: ADMIN_ENDPOINTS.PATIENTS,
    helpdesks: ADMIN_ENDPOINTS.HELPDESKS,
    admins: ADMIN_ENDPOINTS.ADMINS,
    createAdmin: ADMIN_ENDPOINTS.CREATE_ADMIN,
    createDoctor: ADMIN_ENDPOINTS.CREATE_DOCTOR,
    createHelpdesk: ADMIN_ENDPOINTS.ASSIGN_HELPDESK,
    createHospital: ADMIN_ENDPOINTS.CREATE_HOSPITAL,
    updateHospitalStatus: ADMIN_ENDPOINTS.UPDATE_HOSPITAL_STATUS,
    deleteHospital: ADMIN_ENDPOINTS.DELETE_HOSPITAL,
    updateUser: ADMIN_ENDPOINTS.UPDATE_USER,
    deleteUser: ADMIN_ENDPOINTS.DELETE_USER,
    assignDoctor: ADMIN_ENDPOINTS.ASSIGN_DOCTOR,
    assignHelpdesk: ADMIN_ENDPOINTS.ASSIGN_HELPDESK,
    broadcast: ADMIN_ENDPOINTS.BROADCAST,
    audits: ADMIN_ENDPOINTS.AUDITS,
    hospitalDetails: ADMIN_ENDPOINTS.HOSPITAL_DETAILS,
    hospitalDoctors: ADMIN_ENDPOINTS.HOSPITAL_DOCTORS,
    supportRequests: ADMIN_ENDPOINTS.SUPPORT_REQUESTS,
  },
};