# Production OTP setup

1. Revoke the MSG91 AuthKey that was previously shared in chat and create a new one.
2. In MSG91, configure/approve the OTP SMS template and copy its Template ID.
3. On the backend server `.env` set:

```env
OTP_PROVIDER=msg91
MSG91_AUTHKEY=YOUR_NEW_AUTHKEY
MSG91_TEMPLATE_ID=YOUR_TEMPLATE_ID
```

4. Restart the backend.
5. Test with a real mobile number.
6. Do not commit `.env` to GitHub.

MSG91's current documentation shows the V5 SendOTP endpoint requires the mobile number, AuthKey and OTP Template ID, while Verify OTP uses the mobile number, OTP and AuthKey.
