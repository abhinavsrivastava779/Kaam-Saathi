# Kaam Manch - Updated Startup Build

## Updates in this build

1. Admin can browse Workers and Employers from a single Users directory and open complete user details.
2. Worker admin detail includes KYC status, Aadhaar number, Aadhaar photo and current photo. KYC review remains admin-only.
3. Employer registration now asks for employer name and profile photo after first successful OTP verification.
4. Employer worker-search page shows a clear safety disclaimer recommending verified workers.
5. KYC submit flow fixed for the common MongoDB BSON-size failure: uploaded images are compressed in the browser before submission and the server rejects oversized image payloads with a clear message.
6. Rejected KYC shows the admin rejection reason to the worker so they can resubmit.
7. Existing worker availability, dashboard, language, MongoDB and other routes are preserved.

## Run

### Backend
```powershell
cd server
npm install
npm run dev
```

### Frontend
```powershell
cd client
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and add your own MongoDB URI, JWT secret and MSG91 credentials.

**Never commit `.env` to GitHub. Rotate any MSG91 AuthKey/token that has previously been exposed.**

## KYC

KYC images are compressed client-side to reduce MongoDB document-size failures. For a real production launch, move KYC images from MongoDB documents to private object storage with access controls, encryption, retention/deletion policies and audit logging.
