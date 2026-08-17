const mockWhatsappProvider = require('./mockWhatsappProvider');

const getWhatsappProvider = () => {
  const provider = process.env.WHATSAPP_PROVIDER || 'mock';
  switch (provider) {
    case 'mock':
    default:
      return mockWhatsappProvider;
  }
};

module.exports = getWhatsappProvider();
