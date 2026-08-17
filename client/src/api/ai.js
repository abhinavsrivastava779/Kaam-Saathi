import API from './axios';

export const sendAiMessage = async (message, history = []) => {
  const response = await API.post('/ai/chat', { message, history });
  return response.data;
};
