const mobile = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};

const request = async (url, options = {}) => {
  console.log('[MSG91] Request:', url.replace(/authkey=[^&]+/i, 'authkey=***'));
  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  console.log('[MSG91] Response:', {
    status: response.status,
    type: data?.type,
    message: data?.message,
    reqId: data?.requestId || data?.reqId || data?.data?.reqId || data?.data?.requestId
  });

  if (!response.ok || String(data?.type || '').toLowerCase() === 'error') {
    const error = new Error(data?.message || data?.msg || 'MSG91 request failed');
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
};

module.exports = {
  sendOtp: async (phone, otp) => {
    const authkey = process.env.MSG91_AUTHKEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    if (!authkey || !templateId) {
      throw new Error('MSG91_AUTHKEY or MSG91_TEMPLATE_ID missing in .env');
    }

    const params = new URLSearchParams({
      template_id: templateId,
      mobile: mobile(phone),
      authkey,
      otp_length: '4',
      otp_expiry: '10',
      // MSG91 supports an optional OTP value on the SendOTP endpoint.
      // This keeps the development-console OTP identical to the SMS OTP.
      otp: String(otp)
    });

    const data = await request(
      `https://control.msg91.com/api/v5/otp?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'authkey': authkey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    return data;
  },

  verifyOtp: async (phone, otp) => {
    const authkey = process.env.MSG91_AUTHKEY;
    if (!authkey) throw new Error('MSG91_AUTHKEY missing in .env');

    const params = new URLSearchParams({
      otp: String(otp),
      mobile: mobile(phone)
    });

    const data = await request(
      `https://control.msg91.com/api/v5/otp/verify?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'authkey': authkey,
          'Accept': 'application/json'
        }
      }
    );

    const success =
      String(data?.type || '').toLowerCase() === 'success' ||
      /success|verified/i.test(String(data?.message || ''));

    if (!success) {
      throw new Error(data?.message || 'Invalid OTP');
    }
    return data;
  }
};
