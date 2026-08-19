import API from './axios';

export const submitFeedback = async (data) => {
  const response = await API.post('/feedback', data);
  return response.data;
};
