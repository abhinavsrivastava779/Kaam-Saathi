class MockOtpProvider {
  async sendOtp(phone, otp) {
    console.log(`\n========================================`);
    console.log(`[MOCK OTP SERVICE]`);
    console.log(`To Mobile Number: ${phone}`);
    console.log(`Your Kaam Manch OTP is: ${otp}`);
    console.log(`========================================\n`);
    return { success: true, provider: 'mock', messageId: `mock_msg_${Date.now()}` };
  }
}

module.exports = new MockOtpProvider();
