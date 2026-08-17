# काम साथी | Kaam Saathi — Hyperlocal Labor Marketplace

**Kaam Saathi (काम साथी)** is a hyperlocal labor marketplace designed specifically to connect daily-wage workers (मज़दूर) with nearby employers. Built mobile-first, Hindi-first (Devanagari UI), icon-driven, and optimized for low-literacy users, it enables frictionless hiring without complex job forms or compulsory employer authentication.

---

## 🚀 1. Overview & Core Features

### For Employers (मालिक / नियोक्ता):
- **Zero-login Browsing**: Open app and immediately find nearby available workers.
- **Skill Filtering**: Filter by Mistri (🧱), Painter (🎨), Carpenter (🪚), Plumber (🔧), Cleaning (🧹), Helper (💪).
- **Hyperlocal Haversine Distance Filters**: Search workers within 500m, 1 KM, 2 KM, 5 KM, or All distances.
- **Direct Calling**: One-tap phone calling (`tel:`) directly to the worker.
- **Location Sharing**: Share employer GPS coordinates with workers via WhatsApp (`wa.me`) or SMS fallback.

### For Daily-Wage Workers (मज़दूर):
- **1-Task-Per-Screen Registration**: Phone input, Mock OTP, Name (with Web Speech `hi-IN` voice typing), Photo preview, Skill selection, Rate stepper (`[-] [₹700] [+]`), GPS location.
- **Single-Tap Availability Toggle**: Switch between `🟢 आज उपलब्ध` (Available Today) and `🔴 आज उपलब्ध नहीं` (Not Available).
- **Low-Literacy & Non-Smartphone Channels**:
  - **☎️ Helpline (6 AM - 6 PM)**: Live time tracking and operator support banner.
  - **💬 WhatsApp Onboarding**: Pre-filled WhatsApp message + interactive browser bot simulator.
  - **📵 Missed Call System**: `tel:` link + IVR callback simulation engine.
  - **🤖 Interactive IVR Simulator**: Browser voice dialer with keypad and Speech Synthesis (`hi-IN`).

### For Platform Admins:
- Live analytics, source attribution breakdown, worker availability toggle, profile search, and deletion.

---

## 🛠️ 2. Tech Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons, Web Speech API (`hi-IN`), Browser Geolocation API.
- **Backend**: Node.js, Express.js, MongoDB / MongoMemoryServer (Zero-config fallback), Mongoose ODM, JWT Authentication, CORS, Dotenv.
- **Database**: MongoDB with automatic `mongodb-memory-server` fallback for instant developer startup.

---

## 📁 3. Folder Structure

```text
kaam-saathi/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── api/          # Axios, Auth, Worker, IVR, Admin endpoints
│   │   ├── components/   # Header, BottomNav, SkillCard, WorkerCard, AvailabilityToggle, RateStepper, VoiceInput, LocationButton, OtpInput, Loading, ErrorMessage
│   │   ├── pages/        # Home, WorkerSignup, WorkerDashboard, EmployerSearch, EmployerResults, WorkerDetail, Helpline, WhatsappOnboarding, MissedCall, IvrSimulator, AdminDashboard
│   │   ├── context/      # AuthContext, LocationContext
│   │   ├── utils/        # Haversine distance math, Formatters
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── config/           # Database setup with MongoMemoryServer fallback
│   ├── models/           # Worker, Employer, OTP, IVRSession schemas
│   ├── routes/           # Auth, Worker, Location, WhatsApp, IVR, Helpline, Admin routes
│   ├── controllers/      # Route controllers logic
│   ├── middleware/       # Auth JWT middleware, Error Handler
│   ├── services/         # OTP, WhatsApp, Telephony Mock Providers
│   ├── scripts/          # seed.js (40 realistic workers)
│   ├── server.js
│   └── package.json
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## ⚙️ 4. Environment Variables

Create `.env` in the root folder:

```env
MONGO_URI=mongodb://127.0.0.1:27017/kaam_saathi
PORT=5000
JWT_SECRET=kaam_saathi_super_secret_jwt_key_2026

HELPLINE_NUMBER=+919876543210
MISSED_CALL_NUMBER=+919876543211
WHATSAPP_NUMBER=+919876543212

OTP_PROVIDER=mock
WHATSAPP_PROVIDER=mock
TELEPHONY_PROVIDER=mock
```

---

## 📦 5. Installation & Commands

### Step 1: Install all dependencies (Root, Server, Client)
```bash
npm run install-all
```

### Step 2: Seed Demo Data (40 Realistic Workers)
```bash
npm run seed
```
*(Creates 40 workers across Shikohabad, Firozabad, Jasrana, Tundla, Etmadpur, Agra, Mainpuri)*

### Step 3: Run Development Server (Frontend + Backend concurrently)
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`

---

## 🔌 6. Mock Integrations vs Production Providers

- **OTP Service**: In development mode (`OTP_PROVIDER=mock`), OTP is set to `123456` and logged to the backend console.
- **WhatsApp Service**:Generates direct `https://wa.me/?text=...` share links and powers an interactive in-browser bot simulator (`/whatsapp`).
- **IVR & Missed Call**: Supports browser-simulated voice calls (`/ivr`) with SpeechSynthesis in Hindi (`hi-IN`).
- **Production Upgrades**: Easily swap `services/otp`, `services/whatsapp`, or `services/telephony` with Twilio / MSG91 / Firebase / WhatsApp Business API credentials.

---

## 📡 7. API Documentation Endpoints

- `POST /api/auth/send-otp` - Dispatch OTP code
- `POST /api/auth/verify-otp` - Verify OTP & obtain JWT
- `POST /api/workers` - Create or update worker profile
- `GET /api/workers` - List & search workers
- `GET /api/workers/nearby` - Haversine distance search
- `PATCH /api/workers/:id/availability` - Toggle `🟢 आज उपलब्ध` / `🔴 आज उपलब्ध नहीं`
- `POST /api/location/share` - Generate Google Maps + WhatsApp/SMS share links
- `POST /api/whatsapp/process` - Step-by-step WhatsApp bot engine
- `POST /api/ivr/incoming` & `POST /api/ivr/input` - Interactive IVR state machine
- `GET /api/helpline/status` - Live 6 AM - 6 PM operational check
- `GET /api/admin/stats` - Admin metrics & dashboard data

---

## 🔮 8. Future Roadmap

- Integration with real Twilio / Exotel IVR Voice gateways.
- AI Voice Notes parsing using OpenAI Whisper for Hindi dialect recognition.
- Direct SMS broadcasting for daily job alerts.

### Search location behavior
- Manual area/city searches resolve to coordinates and take priority over browser GPS.
- Area/city filtering prevents unrelated workers from other towns appearing in a manual area search.
- GPS remains available through the location button.


## OTP testing
`OTP_DEBUG=true` prints the 4-digit OTP in the backend console. The same OTP is supplied to MSG91 SendOTP. If SMS is not delivered, check MSG91 OTP Logs/DLT mapping.
