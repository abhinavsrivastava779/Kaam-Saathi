# Hanu OTP setup for Kaam Saathi

The project now supports Hanu OTP's **without-DLT SMS OTP** API.

## 1. Get the API key

In the Hanu OTP dashboard, open **API Documentation → Generate API Key** (or copy the API key you already generated).

## 2. Edit `server/.env`

Set:

```env
OTP_PROVIDER=hanu
HANU_OTP_API_KEY=PASTE_YOUR_HANU_API_KEY_HERE
HANU_OTP_TEMPLATE_ID=default
```

Do not put the Hanu API key in the React/client `.env`.

## 3. Start the backend

```powershell
cd C:\Users\abhin\Desktop\Kaam-Saathi-AI-Chatbot-Fixed\kaam-saathi\server
node server.js
```

## 4. Test

Enter a 10-digit Indian mobile number in Kaam Saathi and press **Send OTP**. The backend generates the 4-digit OTP, sends it through Hanu, and stores the same OTP in MongoDB for verification.

The Hanu endpoint configured by this project is:

`https://api.hanuotp.in/sms-otp.php?number=...&OTP=...&apikey=...&templatesid=default`

The API key is kept server-side and is never sent to the browser. The Hanu endpoint must receive the 10-digit Indian number only (for example `8795491255`), not `918795491255`.
