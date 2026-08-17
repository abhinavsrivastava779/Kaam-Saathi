import API from './axios';

export const sendOtp = async (phone) => {
  const response = await API.post('/auth/send-otp', { phone });
  return response.data;
};

export const verifyOtp = async (phone, otp) => {
  const response = await API.post('/auth/verify-otp', { phone, otp });
  return response.data;
};
