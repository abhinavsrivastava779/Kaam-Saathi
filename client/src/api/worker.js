import API from './axios';

export const getWorkers = async (params = {}) => {
  const response = await API.get('/workers', { params });
  return response.data;
};

export const getNearbyWorkers = async (params = {}) => {
  const response = await API.get('/workers/nearby', { params });
  return response.data;
};

export const getWorkerById = async (id) => {
  const response = await API.get(`/workers/${id}`);
  return response.data;
};

export const createWorker = async (workerData) => {
  const response = await API.post('/workers', workerData);
  return response.data;
};

export const updateWorker = async (id, workerData) => {
  const response = await API.patch(`/workers/${id}`, workerData);
  return response.data;
};

export const updateAvailability = async (id, availability) => {
  const response = await API.patch(`/workers/${id}/availability`, { availability });
  return response.data;
};

export const deleteWorker = async (id) => {
  const response = await API.delete(`/workers/${id}`);
  return response.data;
};

export const shareLocation = async (payload) => {
  const response = await API.post('/location/share', payload);
  return response.data;
};

export const addWorkerRating = async (id, rating) => {
  const response = await API.post(`/workers/${id}/rating`, { rating });
  return response.data;
};

export const getMyWorkerProfile=async()=>(await API.get('/workers/me/profile')).data;export const submitWorkerKyc=async(id,payload)=>(await API.post(`/workers/${id}/kyc`,payload)).data;
