import API from './axios';

// =====================================================
// ADMIN AUTH CONFIG
// =====================================================

const adminConfig = () => ({
  headers: {
    Authorization: `Bearer ${
      localStorage.getItem('kaam_saathi_admin_token') || ''
    }`
  }
});


// =====================================================
// ADMIN LOGIN
// =====================================================

export const adminLogin = async (username, password) => {
  const response = await API.post('/admin/login', {
    username,
    password
  });

  return response.data;
};


// =====================================================
// ADMIN STATS
// =====================================================

export const getAdminStats = async () => {
  const response = await API.get(
    '/admin/stats',
    adminConfig()
  );

  return response.data;
};


// =====================================================
// WORKER MANAGEMENT
// =====================================================

export const adminCreateWorker = async (workerData) => {
  const response = await API.post(
    '/admin/workers',
    workerData,
    adminConfig()
  );

  return response.data;
};


export const adminUpdateWorker = async (id, workerData) => {
  const response = await API.patch(
    `/admin/workers/${id}`,
    workerData,
    adminConfig()
  );

  return response.data;
};


export const adminDeleteWorker = async (id) => {
  const response = await API.delete(
    `/admin/workers/${id}`,
    adminConfig()
  );

  return response.data;
};


export const adminUpdateAvailability = async (
  id,
  availability
) => {
  const response = await API.patch(
    `/admin/workers/${id}/availability`,
    { availability },
    adminConfig()
  );

  return response.data;
};


// =====================================================
// ADMIN LOGIN STATE
// =====================================================

export const isAdminLoggedIn = () =>
  Boolean(
    localStorage.getItem('kaam_saathi_admin_token')
  );


export const adminLogout = () =>
  localStorage.removeItem(
    'kaam_saathi_admin_token'
  );


// =====================================================
// KYC
// =====================================================

export const getAdminKyc = async (id) => {
  const response = await API.get(
    `/admin/workers/${id}/kyc`,
    adminConfig()
  );

  return response.data;
};


export const updateAdminKyc = async (
  id,
  status,
  rejectionReason = ''
) => {
  const response = await API.patch(
    `/admin/workers/${id}/kyc`,
    {
      status,
      rejectionReason
    },
    adminConfig()
  );

  return response.data;
};


export const getAdminKycSubmissions = async () => {
  const response = await API.get(
    '/admin/kyc-submissions',
    adminConfig()
  );

  return response.data;
};


// =====================================================
// USERS
// =====================================================

export const getAdminUsers = async () => {
  const response = await API.get(
    '/admin/users',
    adminConfig()
  );

  return response.data;
};


export const getAdminUserDetails = async (
  type,
  id
) => {
  const response = await API.get(
    `/admin/users/${type}/${id}`,
    adminConfig()
  );

  return response.data;
};


// =====================================================
// FEEDBACK
// =====================================================

// Get all feedback
export const getAdminFeedback = async () => {
  const response = await API.get(
    '/admin/feedback',
    adminConfig()
  );

  return response.data;
};


// Update feedback status
export const updateAdminFeedback = async (
  id,
  status
) => {
  const response = await API.patch(
    `/admin/feedback/${id}`,
    {
      status
    },
    adminConfig()
  );

  return response.data;
};


// =====================================================
// WORKER REPORTS
// =====================================================

// Get all worker reports
export const getAdminReports = async () => {
  const response = await API.get(
    '/admin/reports',
    adminConfig()
  );

  return response.data;
};


// Update worker report status
export const updateAdminReport = async (
  id,
  status
) => {
  const response = await API.patch(
    `/admin/reports/${id}`,
    {
      status
    },
    adminConfig()
  );

  return response.data;
};