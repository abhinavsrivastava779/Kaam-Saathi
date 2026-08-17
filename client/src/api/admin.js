import API from './axios';

const adminConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('kaam_saathi_admin_token') || ''}` }
});

export const adminLogin = async (username, password) => {
  const response = await API.post('/admin/login', { username, password });
  return response.data;
};

export const getAdminStats = async () => {
  const response = await API.get('/admin/stats', adminConfig());
  return response.data;
};

export const adminCreateWorker = async (workerData) => {
  const response = await API.post('/admin/workers', workerData, adminConfig());
  return response.data;
};

export const adminUpdateWorker = async (id, workerData) => {
  const response = await API.patch(`/admin/workers/${id}`, workerData, adminConfig());
  return response.data;
};

export const adminDeleteWorker = async (id) => {
  const response = await API.delete(`/admin/workers/${id}`, adminConfig());
  return response.data;
};

export const adminUpdateAvailability = async (id, availability) => {
  const response = await API.patch(`/admin/workers/${id}/availability`, { availability }, adminConfig());
  return response.data;
};

export const isAdminLoggedIn = () => Boolean(localStorage.getItem('kaam_saathi_admin_token'));
export const adminLogout = () => localStorage.removeItem('kaam_saathi_admin_token');

export const getAdminKyc=async id=>(await API.get(`/admin/workers/${id}/kyc`,adminConfig())).data;export const updateAdminKyc=async(id,status,rejectionReason='')=>(await API.patch(`/admin/workers/${id}/kyc`,{status,rejectionReason},adminConfig())).data;

export const getAdminUsers = async () => (await API.get('/admin/users', adminConfig())).data;
export const getAdminUserDetails = async (type, id) => (await API.get(`/admin/users/${type}/${id}`, adminConfig())).data;

export const getAdminKycSubmissions = async () => (await API.get('/admin/kyc-submissions', adminConfig())).data;
