const mobile = (p) => {
  // Hanu OTP "without DLT" API requires exactly the 10-digit
  // Indian mobile number (6/7/8/9...). Do NOT send the 91 prefix.
  const d = String(p || '').replace(/\D/g, '');
  const ten = d.startsWith('91') && d.length === 12 ? d.slice(2) : d.slice(-10);
  return ten;
};

const request = async (phone, otp) => {
  const apiKey = process.env.HANU_OTP_API_KEY;
  const templateId = process.env.HANU_OTP_TEMPLATE_ID || 'default';

  if (!apiKey) {
    throw new Error('HANU_OTP_API_KEY missing in .env');
  }

  const params = new URLSearchParams({
    number: mobile(phone),
    OTP: String(otp),
    apikey: apiKey,
    templatesid: templateId
  });

  const url = `https://api.hanuotp.in/sms-otp.php?${params.toString()}`;

  console.log('[HANU OTP] Sending OTP to:', mobile(phone));

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: '*/*' }
  });

  const text = await response.text();
  let data = text;
  try { data = JSON.parse(text); } catch (_) {}

  // Never print the API key or full request URL.
  console.log('[HANU OTP] Response:', {
    status: response.status,
    body: typeof data === 'string' ? data.slice(0, 500) : data
  });

  // Hanu can return HTTP 200 with an application-level error. Treat
  // both HTTP errors and {status:"error"} responses as failures.
  const providerError = data && typeof data === 'object' &&
    String(data.status || '').toLowerCase() === 'error';

  if (!response.ok || providerError) {
    const message = (data && typeof data === 'object' && data.message)
      ? data.message
      : (typeof data === 'string' && data ? data : 'Hanu OTP request failed');
    const error = new Error(message);
    error.status = response.status >= 400 ? response.status : 502;
    error.details = data;
    throw error;
  }

  return {
    success: true,
    provider: 'hanuotp',
    response: data
  };
};

module.exports = {
  sendOtp: request,

  // Hanu's API shown in the dashboard is a Send-OTP API. OTP verification
  // is therefore handled by Kaam Manch using the OTP stored in MongoDB.
  verifyOtp: async () => ({ success: true, provider: 'hanuotp-local-verify' })
};
