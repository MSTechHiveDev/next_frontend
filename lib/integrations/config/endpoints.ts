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
  CREATE_DOCTOR: '/admin/create-doctor',
  UPDATE_USER: (id: string) => `/admin/users/${id}`,
  DELETE_USER: (id: string, role?: string) => role ? `/admin/users/${id}?role=${role}` : `/admin/users/${id}`,
  BROADCAST: '/admin/broadcast',
  AUDITS: '/admin/audits',
  HOSPITAL_DETAILS: (id: string) => `/admin/hospitals/${id}/details`,
  HOSPITAL_DOCTORS: (id: string) => `/admin/hospitals/${id}/doctors`,
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