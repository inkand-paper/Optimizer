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

## 5. UI Structure & Theming
- **`components/ui-elements.tsx`**: Contains our "Design System". All buttons, cards, and inputs live here to ensure they look the same everywhere.
- **`app/globals.css`**: Defines our "Dark Mode" colors. We use the `.dark` class logic to switch background and text colors instantly.
- **`components/navbar.tsx`**: A smart component that checks if `localStorage.getItem("token")` exists to decide whether to show "Login" or "Dashboard".

---

## 📂 Project Directory Map
- `/app`: The heart of the project. Contains every Page and API endpoint.
- `/prisma`: The blueprint for your Database tables (Users and Keys).
- `/components`: Reusable puzzle pieces like the Navbar and Theme Toggle.
- `/lib`: Helper functions (The "Brain" behind the scenes).
- `/public`: Static images and logos.
