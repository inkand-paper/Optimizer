# 🚢 Deployment Checklist

Follow these steps to move from Local Development to Production.

## 1. Database (Supabase)
- [ ] Create a new Project in Supabase.
- [ ] Go to **Settings > Database > Connection Pooling**.
- [ ] Use the **Transaction (Port 6543)** connection string.
- [ ] Ensure `?pgbouncer=true` is added to the end of the URL.
- [ ] Run `npx prisma db push` to sync your schema once.

## 2. Environment Variables (Vercel)
Add these to your Project Settings on Vercel:
- `DATABASE_URL`: Your Supabase Pooler string.
- `JWT_SECRET`: A long, random string for auth security.
- `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., `https://osakagroupbd.com`).
- `NEXTAUTH_URL`: Your production URL.
- `GMAIL_USER`: Your support/alert email address.
- `GMAIL_APP_PASSWORD`: Your Google "App Password".
- `GEMINI_API_KEY`: Your Google AI key for Pulse-AI.
- `LEMONSQUEEZY_WEBHOOK_SECRET`: For payment validation.

## 3. Build Configuration
- [ ] Ensure `package.json` has `"postinstall": "prisma generate"`.
- [ ] Verify you are using Node version **20.x** (Vercel default).

## 4. Final Security Check
- [ ] Register your first account on the live site.
- [ ] Generate an API Key.
- [ ] **Revoke any test keys** used during development.
- [ ] Verify that Login/Register pages are working in production.
- [ ] Verify that the Theme Toggle state persists in the browser.

---

## 🔒 Security Best Practices
1. **Never** commit your `.env` file to GitHub.
2. **Never** share your `JWT_SECRET`.
3. If an API Key is compromised, **Revoke** it immediately in the dashboard.