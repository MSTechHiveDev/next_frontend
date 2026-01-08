export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHECK_EXISTENCE: '/auth/check-existence',
};

export const USER_ENDPOINTS = {
  PROFILE: '/auth/me', // Unified profile endpoint in new backend
  PATCH_PROFILE: '/auth/me',
  PATIENT_PROFILE: '/patients/profile',
  DOCTOR_PROFILE: '/doctors/me',
  UPDATE_PATIENT_PROFILE: '/patients/profile',
  UPDATE_DOCTOR_PROFILE: '/doctors/me',
  ATTENDANCE: '/staff/attendance/me',
  ATTENDANCE_TODAY_STATUS: '/staff/attendance/me', // Use /me and filter today in frontend if needed, or backend might return it
  ATTENDANCE_CHECK_IN: '/staff/attendance/check-in',
  ATTENDANCE_CHECK_OUT: '/staff/attendance/check-out',
};

export const ADMIN_ENDPOINTS = {
  DASHBOARD: '/super-admin/stats',
  USERS: '/super-admin/users',
  DOCTORS: '/super-admin/users?role=doctor',
  PATIENTS: '/super-admin/users?role=patient',
  HELPDESKS: '/super-admin/users?role=helpdesk',
  ADMINS: '/super-admin/users?role=admin',
  HOSPITALS: '/super-admin/hospitals',
  CREATE_HOSPITAL: '/super-admin/create-hospital',
  UPDATE_HOSPITAL: (id: string) => `/hospitals/${id}`,
  DELETE_HOSPITAL: (id: string) => `/hospitals/${id}`,
  UPDATE_HOSPITAL_STATUS: (id: string) => `/super-admin/hospitals/${id}/status`,
  ASSIGN_DOCTOR: '/hospital/assign-doctor',
  ASSIGN_HELPDESK: '/hospital/assign-helpdesk',
  CREATE_ADMIN: '/super-admin/create-hospital-admin',
  CREATE_HOSPITAL_ADMIN: '/super-admin/create-hospital-admin',
  CREATE_DOCTOR: '/hospital/create-doctor',
  UPDATE_USER: (id: string) => `/super-admin/users/${id}`,
  DELETE_USER: (id: string, _role?: string) => `/super-admin/users/${id}`,
  DELETE_HELPDESK: (id: string) => `/helpdesk/${id}`,
  BROADCAST: '/super-admin/broadcast',
  AUDITS: '/super-admin/audits',
  HOSPITAL_DETAILS: (id: string) => `/hospital/hospitals/${id}/details`,
  HOSPITAL_DOCTORS: (id: string) => `/hospital/hospitals/${id}/doctors`,
  SUPPORT_REQUESTS: '/support',
};

export const PHARMACY_ENDPOINTS = {
  PRODUCTS: {
    BASE: '/pharmacy/products',
    BULK: '/pharmacy/products/bulk',
    BY_ID: (id: string) => `/pharmacy/products/${id}`,
  },
  SUPPLIERS: {
    BASE: '/pharmacy/suppliers',
    BY_ID: (id: string) => `/pharmacy/suppliers/${id}`,
    PRODUCTS: (id: string) => `/pharmacy/suppliers/${id}/products`,
  },
  BILLS: {
    BASE: '/pharmacy/bills',
    BY_ID: (id: string) => `/pharmacy/bills/${id}`,
    STATS: '/pharmacy/bills/stats',
  },
};

export const LAB_ENDPOINTS = {
  BILLING: {
    BASE: '/lab/billing',
    BY_ID: (id: string) => `/lab/billing/${id}`,
  },
  DASHBOARD: {
    STATS: '/lab/dashboard-stats',
  },
  SAMPLES: {
    BASE: '/lab/samples',
    BY_ID: (id: string) => `/lab/samples/${id}`,
    STATUS: (id: string) => `/lab/samples/${id}/status`,
    RESULTS: (id: string) => `/lab/samples/${id}/results`,
  },
  TESTS: {
    BASE: '/lab/tests',
    BY_ID: (id: string) => `/lab/tests/${id}`,
  },
  DEPARTMENTS: {
    BASE: '/lab/departments',
    BY_ID: (id: string) => `/lab/departments/${id}`,
  },
};

export const HOSPITAL_ADMIN_ENDPOINTS = {
  DASHBOARD: '/hospital/dashboard',
  STATS: '/hospital/stats',
  HOSPITAL: '/hospital/hospital',
  DOCTORS: '/hospital/users?role=doctor',
  CREATE_DOCTOR: '/hospital/create-doctor',
  DOCTOR_DETAIL: (id: string) => `/doctors/${id}`,
  UPDATE_DOCTOR: (id: string) => `/hospital/users/${id}`,
  DELETE_DOCTOR: (id: string) => `/super-admin/users/${id}`,
  HELPDESKS: '/hospital/users?role=helpdesk',
  CREATE_HELPDESK: '/hospital/create-helpdesk',
  HELPDESK_DETAIL: (id: string) => `/helpdesk/${id}`,
  PATIENTS: '/hospital/users?role=patient',
  PHARMA: '/hospital/users?role=pharma-owner',
  LABS: '/hospital/users?role=lab',
  STAFF: '/hospital/users?role=staff',
  STAFF_DETAIL: (id: string) => `/hospital/users/${id}`,
  CREATE_STAFF: '/hospital/users',
  UPDATE_STAFF: (id: string) => `/hospital/users/${id}`,
  DELETE_STAFF: (id: string) => `/super-admin/users/${id}`,
  ATTENDANCE: '/hospital/attendance/report',
  ATTENDANCE_STATS: '/hospital/attendance/report',
  ATTENDANCE_DETAIL: (id: string) => `/hospital/attendance/${id}`,
  UPDATE_ATTENDANCE: (id: string) => `/hospital/attendance/${id}`,
  DELETE_ATTENDANCE: (id: string) => `/hospital/attendance/${id}`,
  PAYROLL: '/staff/attendance/payroll',
  ANNOUNCEMENTS: '/notifications',
};

export const HELPDESK_ENDPOINTS = {
  DASHBOARD: '/helpdesk/dashboard',
  ME: '/helpdesk/me',
  DOCTORS: '/doctors',
  CREATE_DOCTOR: '/hospital/create-doctor',
  PATIENTS_SEARCH: '/frontdesk/patients',
  PATIENT_DETAILS: (id: string) => `/frontdesk/patients/${id}`,
  REGISTER_PATIENT: '/frontdesk/patients/register',
  APPOINTMENTS: '/bookings/my-appointments',
  APPOINTMENT_STATUS: (id: string) => `/bookings/${id}/status`,
};

export const BOOKING_ENDPOINTS = {
  AVAILABILITY: '/bookings/availability',
  BOOK: '/bookings/book',
  STATS: '/bookings/hospital/stats',
  MY_APPOINTMENTS: '/bookings/my-appointments',
};

export const DOCTOR_ENDPOINTS = {
  DASHBOARD: '/doctors/me',
  PROFILE: '/doctors/me',
  MY_PATIENTS: '/doctors/my-patients',
  CALENDAR_STATS: '/doctors/calendar/stats',
  CALENDAR_APPOINTMENTS: '/doctors/calendar/appointments',
  QUICK_NOTES: '/doctors/quick-notes',
  START_NEXT: '/doctors/start-next',
};

export const STAFF_ENDPOINTS = {
  DASHBOARD: '/staff/attendance/me',
  PROFILE: '/auth/me',

  
  // Attendance
  ATTENDANCE: '/staff/attendance/me',
  ATTENDANCE_HISTORY: '/staff/attendance/me',
  TODAY_STATUS: '/staff/attendance/me',
  CHECK_IN: '/staff/attendance/check-in',
  CHECK_OUT: '/staff/attendance/check-out',

  
  // Leave Management
  LEAVES: '/leaves',
  LEAVE_DETAIL: (id: string) => `/leaves/${id}`,
  CREATE_LEAVE: '/leaves',
  UPDATE_LEAVE: (id: string) => `/leaves/${id}`,
  DELETE_LEAVE: (id: string) => `/leaves/${id}`,
  LEAVE_BALANCE: '/leaves/balance',

  // Schedules
  SCHEDULE: '/staff/schedule',

  // Payroll
  PAYROLL: '/staff/attendance/payroll',

  // Announcements
  ANNOUNCEMENTS: '/notifications',
};

export const COMMON_ENDPOINTS = {
  MY_ANNOUNCEMENTS: '/notifications',
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
  users: '/super-admin/users',
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