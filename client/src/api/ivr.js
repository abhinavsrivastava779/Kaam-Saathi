import API from './axios';

export const startIvr = async (phone) => {
  const response = await API.post('/ivr/incoming', { phone });
  return response.data;
};

export const sendIvrInput = async (payload) => {
  const response = await API.post('/ivr/input', payload);
  return response.data;
};

export const triggerCallback = async (phone) => {
  const response = await API.post('/ivr/callback', { phone });
  return response.data;
};

export const getHelplineStatus = async () => {
  const response = await API.get('/helpline/status');
  return response.data;
};
