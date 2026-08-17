import API from './axios';

export const reverseGeocode = async (lat, long) => {
  const response = await API.get('/location/reverse', { params: { lat, lon: long } });
  return response.data;
};

export const searchLocation = async (query) => {
  const response = await API.get('/location/search', { params: { q: query } });
  return response.data;
};
