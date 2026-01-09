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
  DASHBOARD: '/pharmacy/dashboard',
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
    BASE: '/pharmacy/invoices',
    BY_ID: (id: string) => `/pharmacy/invoices/${id}`,
    STATS: '/pharmacy/reports/dashboard',
  },
};

export const LAB_ENDPOINTS = {
  BILLING: {
    BASE: '/lab/invoices',
    BY_ID: (id: string) => `/lab/orders/${id}/invoice`,
  },
  DASHBOARD: {
    STATS: '/lab/dashboard-stats',
  },
  SAMPLES: {
    BASE: '/lab/orders',
    BY_ID: (id: string) => `/lab/orders/${id}`,
    STATUS: (id: string) => `/lab/orders/${id}/collect`,
    RESULTS: (id: string) => `/lab/orders/${id}/results`,
  },
  TESTS: {
    BASE: '/lab/tests',
    BY_ID: (id: string) => `/lab/tests/${id}`,
  },
  DEPARTMENTS: {
    BASE: '/lab/departments',
    BY_ID: (id: string) => `/lab/departments/${id}`,
  },
  META: '/lab/meta',
};

export const HOSPITAL_ADMIN_ENDPOINTS = {
  DASHBOARD: '/hospital/dashboard',
  STATS: '/hospital/stats',
  HOSPITAL: '/hospital/hospital',
  DOCTORS: '/hospital/users?role=doctor',
  CREATE_DOCTOR: '/hospital/create-doctor',
  DOCTOR_DETAIL: (id: string) => `/doctors/${id}`,
  UPDATE_DOCTOR: (id: string) => `/hospital/users/${id}`,
  DELETE_DOCTOR: (id: string) => `/hospital/users/${id}`,
  HELPDESKS: '/hospital/users?role=helpdesk',
  CREATE_HELPDESK: '/hospital/create-helpdesk',
  HELPDESK_DETAIL: (id: string) => `/hospital/helpdesks/${id}`,
  PATIENTS: '/hospital/users?role=patient',
  PHARMA: '/hospital/users?role=pharma-owner',
  LABS: '/hospital/users?role=lab',
  STAFF: '/hospital/users?role=staff',
  STAFF_DETAIL: (id: string) => `/hospital/staff/${id}`,
  CREATE_STAFF: '/hospital/users',
  UPDATE_STAFF: (id: string) => `/hospital/users/${id}`,
  DELETE_STAFF: (id: string) => `/hospital/users/${id}`,
  ATTENDANCE: '/hospital/attendance',
  ATTENDANCE_STATS: '/hospital/attendance/report',
  ATTENDANCE_DETAIL: (id: string) => `/hospital/attendance/${id}`,
  UPDATE_ATTENDANCE: (id: string) => `/hospital/attendance/${id}`,
  DELETE_ATTENDANCE: (id: string) => `/hospital/attendance/${id}`,
  ANNOUNCEMENTS: '/notifications',
  TRANSACTIONS: '/hospital/transactions',
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
  TRANSACTIONS: '/helpdesk/transactions',
};

export const BOOKING_ENDPOINTS = {
  AVAILABILITY: '/bookings/availability',
  BOOK: '/bookings/book',
  STATS: '/bookings/hospital/stats',
  MY_APPOINTMENTS: '/bookings/my-appointments',
  DETAILS: (id: string) => `/bookings/${id}`,
};

export const DOCTOR_ENDPOINTS = {
  DASHBOARD: '/doctors/dashboard',
  PROFILE: '/doctors/me',
  MY_PATIENTS: '/doctors/my-patients',
  CALENDAR_STATS: '/doctors/calendar/stats',
  CALENDAR_APPOINTMENTS: '/doctors/calendar/appointments',
  QUICK_NOTES: '/doctors/quick-notes',
  START_NEXT: '/doctors/start-next',
  PATIENT_DETAILS: (id: string) => `/patient/${id}`,
  // Consultation Workflow
  START_CONSULTATION: (id: string) => `/doctor/appointments/${id}/start`,
  END_CONSULTATION: (id: string) => `/doctor/appointments/${id}/end`,
  CONSULTATION_SUMMARY: (id: string) => `/doctor/appointments/${id}/summary`,
  CREATE_PRESCRIPTION: '/doctor/prescriptions',
  CREATE_LAB_TOKEN: '/doctor/lab-tokens',
  SEND_TO_HELPDESK: '/doctor/send-to-helpdesk',
  GET_PRESCRIPTION: (id: string) => `/doctor/prescriptions/${id}`,
  GET_LAB_TOKEN: (id: string) => `/doctor/lab-tokens/${id}`,
  UPLOAD_PHOTO: '/doctors/upload-photo',
};

export const TRANSIT_ENDPOINTS = {
  LIST: '/helpdesk/transits',
  COLLECT: (id: string) => `/helpdesk/transits/${id}/collect`,
};


export const STAFF_ENDPOINTS = {
  DASHBOARD: '/staff/attendance/dashboard',
  PROFILE: '/staff/attendance/profile',

  // Attendance
  ATTENDANCE: '/staff/attendance/me',
  ATTENDANCE_HISTORY: '/staff/attendance/me',
  TODAY_STATUS: '/staff/attendance/today-status',
  CHECK_IN: '/staff/attendance/check-in',
  CHECK_OUT: '/staff/attendance/check-out',


  // Leave Management
  LEAVES: '/leaves',
  LEAVE_DETAIL: (id: string) => `/leaves/${id}`,
  CREATE_LEAVE: '/leaves/request',
  UPDATE_LEAVE: (id: string) => `/leaves/${id}`,
  DELETE_LEAVE: (id: string) => `/leaves/${id}`,
  LEAVE_BALANCE: '/leaves/balance',

  // Schedules
  SCHEDULE: '/staff/attendance/schedule',

  // Payroll
  PAYROLL: '/staff/attendance/self-payroll',

  // Announcements
  ANNOUNCEMENTS: '/announcements/hospital',
};

export const NOTIFICATION_ENDPOINTS = {
  BASE: '/notifications',
  READ: (id: string) => `/notifications/${id}/read`,
  READ_ALL: '/notifications/read-all',
};

export const PATIENT_ENDPOINTS = {
  PROFILE: '/patients/profile',
  PROFILE_BY_ID: (id: string) => `/patients/profile/${id}`,
  UPDATE_PROFILE: '/patients/profile',
};

export const SUPPORT_ENDPOINTS = {
  CREATE: '/support',
  MY_TICKETS: '/support/my-tickets',
  LIST: '/support',
  DETAILS: (id: string) => `/support/${id}`,
  REPLY: (id: string) => `/support/${id}/reply`,
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