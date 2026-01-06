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
  HOSPITALS: '/admin/hospitals',
  CREATE_HOSPITAL: '/admin/create-hospital',
  UPDATE_HOSPITAL: (id: string) => `/admin/hospitals/${id}`,
  DELETE_HOSPITAL: (id: string) => `/admin/hospitals/${id}`,
  UPDATE_HOSPITAL_STATUS: (id: string) => `/admin/hospitals/${id}/status`,
  ASSIGN_DOCTOR: '/admin/hospitals/assign-doctor',
  ASSIGN_HELPDESK: '/admin/assign-helpdesk',
  BROADCAST: '/admin/broadcast',
  AUDITS: '/admin/audits',
  HOSPITAL_DETAILS: (id: string) => `/admin/hospitals/${id}/details`,
  HOSPITAL_DOCTORS: (id: string) => `/admin/hospitals/${id}/doctors`,
  SUPPORT_REQUESTS: '/support',
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
    doctors: `${ADMIN_ENDPOINTS.USERS}?role=doctor`,
    patients: `${ADMIN_ENDPOINTS.USERS}?role=patient`,
    helpdesks: `${ADMIN_ENDPOINTS.USERS}?role=helpdesk`,
    admins: `${ADMIN_ENDPOINTS.USERS}?role=admin`,
    createAdmin: '/admin/create-admin',
    createDoctor: '/admin/create-doctor',
    createHelpdesk: '/admin/create-helpdesk',
    createHospital: ADMIN_ENDPOINTS.CREATE_HOSPITAL,
    updateHospitalStatus: ADMIN_ENDPOINTS.UPDATE_HOSPITAL_STATUS,
    deleteHospital: ADMIN_ENDPOINTS.DELETE_HOSPITAL,
    assignDoctor: ADMIN_ENDPOINTS.ASSIGN_DOCTOR,
    assignHelpdesk: ADMIN_ENDPOINTS.ASSIGN_HELPDESK,
    broadcast: ADMIN_ENDPOINTS.BROADCAST,
    audits: ADMIN_ENDPOINTS.AUDITS,
    hospitalDetails: ADMIN_ENDPOINTS.HOSPITAL_DETAILS,
    hospitalDoctors: ADMIN_ENDPOINTS.HOSPITAL_DOCTORS,
    supportRequests: ADMIN_ENDPOINTS.SUPPORT_REQUESTS,
  },
};