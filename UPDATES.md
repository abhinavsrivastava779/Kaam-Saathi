# Kaam Manch – Updated Build

## Changes in this build

1. **Voice assistant / voice input**
   - More reliable Hindi speech recognition.
   - Automatically restarts when Chrome stops recognition after a pause.
   - Clear microphone/permission/error messages.
   - Stop button while listening.
   - Added voice input to the Chatbot simulator too.

2. **Chatbot location during ID creation**
   - ID creation now asks for location after daily rate.
   - Added **“📍 मेरी location लें”** button in the Chatbot simulator.
   - GPS coordinates are reverse-geocoded into locality + city + state.
   - Manual area/city entry is also supported.

3. **Worker ratings**
   - Worker profiles now have average rating and rating count.
   - Users can submit a 1–5 star rating directly from a worker card.
   - Added rating API endpoint.
   - Seed data includes sample ratings.

4. **Bot naming**
   - Visible UI wording changed from **WhatsApp Bot / बॉट** to **Chatbot**.

5. **Area + city location display**
   - GPS results now combine locality and city, for example:
     **Krishna Nagar, Mathura**
   - Added a Mathura/Krishna Nagar demo location to seed data and location lookup.

## Run

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

For GPS, use `localhost` or HTTPS and allow browser Location permission.
For browser voice input, Chrome/Edge with microphone permission is recommended.

## Startup Update – OTP, Login, Availability & KYC

### 1. Real OTP provider
- Added MSG91 provider support in `server/services/otp/msg91Provider.js`.
- Set `OTP_PROVIDER=msg91`, `MSG91_AUTHKEY`, and `MSG91_TEMPLATE_ID` in the server `.env` for real SMS OTP.
- Mock OTP remains available for local development.
- Never put MSG91 AuthKey in React/Vite frontend code.

### 2. Login
- Worker: mobile OTP login/register flow.
- Employer: new mobile OTP login at `/employer/login`.
- Employer search now requires employer login.

### 3. Worker availability
- `availability` remains a first-class worker field.
- Dashboard has the prominent “आज उपलब्ध” toggle.
- Employer results keep available workers first.
- Worker cards show “आज उपलब्ध / आज उपलब्ध नहीं”.

### 4. Worker KYC
- Every new worker starts with `kyc.status = pending` and UI shows `NOT VERIFIED`.
- Worker dashboard provides:
  - Aadhaar number
  - Aadhaar photo
  - Current/personal photo
- Successful submission shows a 24-hour verification popup.
- Admin dashboard has a KYC review action to see the Aadhaar number, Aadhaar photo and current photo.
- Admin can Verify or Reject KYC.
- Worker profile changes from `NOT VERIFIED` to `VERIFIED` after admin approval.
- Public worker APIs do not expose Aadhaar number/photos.

### Production security note
The current ZIP uses image data in MongoDB to keep the project self-contained. Before a public startup launch, move KYC images to private object storage (S3/Cloudinary/etc.), encrypt sensitive Aadhaar data at rest, add strict audit logs/role permissions, retention/deletion rules and legal/privacy compliance for Aadhaar processing.


## Latest UI updates
- Employer: after OTP, name is mandatory; profile photo is optional.
- Worker KYC: Current Photo action explicitly supports mobile camera capture via `capture="user"` and upload.
