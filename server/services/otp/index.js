const mock = require('./mockOtpProvider');
const msg91 = require('./msg91Provider');
const hanu = require('./hanuOtpProvider');

const provider = String(process.env.OTP_PROVIDER || 'mock').toLowerCase();

if (provider === 'hanu' || provider === 'hanuotp') {
  module.exports = hanu;
} else if (provider === 'msg91') {
  module.exports = msg91;
} else {
  module.exports = mock;
}
