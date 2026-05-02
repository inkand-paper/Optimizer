# 📖 Code Walkthrough: Line-by-Line Guide

This guide explains the most important parts of the code so you can understand, modify, and master the project.

---

## 1. User Registration (`app/api/auth/register/route.ts`)
This is the "Front Gate" where customers sign up for your SaaS.

```typescript
// 1. We check if the email and password sent are valid using Zod.
const parsedData = registerSchema.parse(body);

// 2. We check if this email exists already.
const existingUser = await prisma.user.findUnique({ ... });

// 3. IMPORTANT: We hash the password before saving!
// We never store "mypassword123". We store a long scrambled string.
const hashed = await hashPassword(parsedData.password);

// 4. We save the new user to our database.
const newUser = await prisma.user.create({ ... });

// 5. We give the user their Login Wristband (JWT Token).
const token = signJwt({ userId: newUser.id, email: newUser.email });
```

---

## 2. API Key Generation (`app/api/keys/route.ts`)
This happens when you click "Create Key" in your Dashboard.

```typescript
// 1. Generate a random, high-security string.
// We add "opt_" to the front so it's easy to identify.
const prefix = 'opt_';
const randomString = crypto.randomBytes(32).toString('base64url');
const plainApiKey = `${prefix}${randomString}`;

// 2. We hash it! Just like a password.
const hashedKey = hashApiKey(plainApiKey);

// 3. Save the hash to the database, tied to your User ID.
const newKey = await prisma.apiKey.create({
  data: { name, keyHash: hashedKey, userId: decoded.userId }
});

// 4. Return the plain key TO THE USER ONLY ONCE.
// After this, only the "Hashed bits" are kept for security.
return NextResponse.json({ apiKey: plainApiKey });
```

---

## 3. Website Analyzer (`app/api/analyze/route.ts`)
This is the "Health Inspector" that scans a URL.

```typescript
// 1. It fetches the URL using standard HTTP.
const response = await fetch(url, { headers: { 'User-Agent': 'NextOptimizerBot' } });
const html = await response.text();

// 2. It uses "Regex" (think of these as search patterns) to find tags.
const titleMatch = html.match(/<title>(.*?)<\/title>/i);
const descMatch = html.match(/<meta name="description" content="(.*?)"/i);

// 3. It calculates a Score out of 100.
let score = 0;
if (metrics.hasTitle) score += 20;
if (metrics.isSsl) score += 20; // ... and so on
```

---

## 4. Cache Revalidation (`app/api/revalidate/route.ts`)
This is the API your external tools (mobile apps) will call.

```typescript
// 1. Get the key from the "Authorization" header.
const authHeader = request.headers.get('authorization');
const apiKey = authHeader?.replace('Bearer ', '');

// 2. Hash it to compare with our database.
const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

// 3. Lookup the key in the database.
const dbKey = await prisma.apiKey.findUnique({ where: { keyHash: hashedKey } });

// 4. If validated, tell Next.js to clear the cache.
if (tag) {
  revalidateTag(tag); // The Actual Cache Purge happens here!
}
```

---

## 5. AI Integration (`app/api/ai/chat/route.ts`)
The intelligence layer of NexPulse.
```typescript
// 1. We load the Gemini Pro model.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. We inject a System Prompt that defines the AI's persona and rules.
const SYSTEM_PROMPT = `You are Pulse-AI...`;

// 3. We maintain chat history to allow for conversational context.
const chat = model.startChat({ history: chatHistory });
```

---

## 6. Global Security Proxy (`proxy.ts`)
Every API call passes through this "Shield" before reaching the business logic.
```typescript
// 1. We handle CORS by checking the Origin against NEXT_PUBLIC_APP_URL.
if (isProduction && !isExactMatch && !authHeader) return 403;

// 2. We inject security headers (Anti-Clickjacking, etc.).
response.headers.set('X-Frame-Options', 'DENY');

// 3. We log diagnostics to help developers debug API timing in production.
console.log(`📱 API Call: ${request.method} ${request.nextUrl.pathname}`);
```

---

## 📂 Project Directory Map
- `/app`: The heart of the project. Contains every Page and API endpoint.
- `/core`: The "Pulse Engine" logic (Analyzers, Monitoring core).
- `/lib`: Shared utilities (Database, Auth, Mail, Logging).
- `/scripts`: Diagnostic and administrative utilities.
- `/cli`: The standalone `njo` command-line tool.

---

## 7. Stability & Performance
The project is optimized for high-concurrency environments:
- **Memory Management**: Uses increased heap limits in `package.json` to prevent crashes during heavy builds.
- **SSRF Shield**: Uses a custom URL validation layer (`lib/ssrf.ts`) to prevent server-side request forgery attacks.
- **Hybrid Mailing**: Uses Nodemailer with Gmail App Passwords for free, reliable production delivery.

---

## 8. UX Optimizations (Dashboard)
- **Auth Resilience**: Added an `authLoading` state to the dashboard to eliminate verification screen flickering.
- **Smart Forms**: Forgot password and reset password flows handle secure token validation and user feedback.
- **Mobile First**: Uses a custom hybrid navigation model to ensure the UI feels native on both iOS and Android.
