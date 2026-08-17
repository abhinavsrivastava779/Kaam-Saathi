import API from './axios';
export const sendEmployerOtp = async (phone) => (await API.post('/auth/employer/send-otp', { phone })).data;
export const verifyEmployerOtp = async (phone, otp) => (await API.post('/auth/employer/verify-otp', { phone, otp })).data;
export const getEmployerProfile = async () => (await API.get('/employers/me/profile')).data;
export const updateEmployerProfile = async (payload) => (await API.patch('/employers/me/profile', payload)).data;
