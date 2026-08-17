const mockTelephonyProvider = require('./mockTelephonyProvider');

const getTelephonyProvider = () => {
  const provider = process.env.TELEPHONY_PROVIDER || 'mock';
  switch (provider) {
    case 'mock':
    default:
      return mockTelephonyProvider;
  }
};

module.exports = getTelephonyProvider();
