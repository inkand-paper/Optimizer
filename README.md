# 🚀 Next.js Optimizer Suite (SaaS Edition)

Professional-grade cache revalidation, website analysis, and server health monitoring for modern Next.js applications.

---

## 🌟 What is this?
Think of this application as a **"Remote Control" for your website's performance.** It transforms your Next.js project into a controllable ecosystem where external machines (like Android Apps or Store Backends) can securely trigger cache updates and monitor health.

### 💎 Key Features
- **SaaS Dashboard**: A premium, responsive command center for managing API keys and audits.
- **Website Analyzer**: Real-time scanning engine that scores your site's SEO, Security (SSL), and Speed.
- **Interactive Playground**: A sandbox to test your API keys and revalidation logic with high-contrast security feedback.
- **System Health Monitor**: Live tracking of API uptime, memory usage, and server stability.
- **Enterprise Security**: Keys are stored as high-entropy SHA-256 hashes (Stripe-grade security).

---

## 📚 Essential Guides
We have written special documentation for every level of experience:
1.  **[CONCEPTS.md](./CONCEPTS.md)**: 📖 **READ THIS FIRST**. Explains the logic using simple analogies like "Lassos" and "Wristbands".
2.  **[API_DOCS.md](./API_DOCS.md)**: 🔌 Technical specs for developers wanting to connect their apps.
3.  **[CODE_WALKTHROUGH.md](./CODE_WALKTHROUGH.md)**: 📂 A file-by-file map of where everything is located.
4.  **[ANDROID_INTEGRATION.md](./ANDROID_INTEGRATION.md)**: 📱 A specific guide for mobile developers.

---

## 🛠 Quick Start for the SaaS Owner

### 1. Prerequisites
- **Node.js**: >= 20.0.0
- **Database**: A PostgreSQL database (e.g., Supabase or Neon).

### 2. Environment Setup
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-super-secret-random-string"
```

### 3. Launching Locally
```bash
npm install          # Install dependencies
npx prisma generate  # Connect the database
npm run dev          # Start the engine (Optimized for 16GB+ RAM)
```
> [!NOTE]
> The `dev` script is configured with a 2.5GB memory limit and uses the Webpack engine to ensure stability on Windows systems.

### 4. Deploying to the Cloud
1. Push your code to **GitHub**.
2. Connect the repo to **Vercel**.
3. Add your `DATABASE_URL` and `JWT_SECRET` in the Vercel Settings.
4. Done! Your SaaS is live.

---

## 🏗 Technology Stack
- **Foundation**: Next.js 15+ (App Router)
- **Database**: Prisma ORM with PostgreSQL (Supabase)
- **Styling**: Tailwind CSS (Dual-Theme Light/Dark)
- **UI Components**: Lucide Icons & Custom Premium Component Library
- **Security**: JWT Sessions & SHA-256 Machine Key Hashing

---

## 🛡 Security & Privacy
We take security seriously. Raw API keys are **never stored** in our database. We only store a hash. This ensures that even if the database is compromised, your users' connection keys remain mathematically impossible to recover.
