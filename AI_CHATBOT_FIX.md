# Kaam Manch AI Chatbot Fix

The AI chatbot flow was fixed so that:

1. An existing token is restored from `/api/auth/me` on page load.
2. The AI page waits for session restoration instead of immediately showing the login screen.
3. AI login buttons remember that the user came from `/ai-chat`.
4. After worker/employer login/profile completion, the user returns to `/ai-chat`.
5. The AI backend no longer treats placeholder keys such as `your_openai_key_here` as real API keys; it uses the built-in fallback instead.
6. A real OpenAI/Gemini key can still be configured in the server `.env` for generative Hinglish replies.

## Run

Server:

```powershell
cd server
npm install
node server.js
```

Client:

```powershell
cd client
npm install
npm run dev
```

Do not copy the old `.env` from the ZIP. Create your local `.env` from `.env.example` and put your own secrets there.
