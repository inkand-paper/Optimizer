# 🔌 API Documentation

This guide covers how to integrate with the Next.js Optimizer Suite.

## Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://your-deployment-domain.com`

---

## 🛠 Authentication

All "Machine" endpoints require an API Key issued from your dashboard.

**Header**:
```http
Authorization: Bearer opt_your_api_key_here
```

---

## 🚀 Endpoints

### 1. Health & Status
**GET** `/api/health`

Tells you if the server is alive and shows memory usage. No key required.

---

### 2. Cache Revalidation
**POST** `/api/revalidate`

Triggers Next.js to clear the cache and fetch new data.

**Request Payload**:
```json
{
  "tag": "products"
}
```

---

### 3. Website Analyzer
**POST** `/api/analyze`

Scans a website for SEO, SSL, and Performance metrics.

**Request Payload**:
```json
{
  "url": "https://google.com"
}
```

---

## ⚠️ Error Codes

| Code | Meaning | Solution |
| :--- | :--- | :--- |
| **401** | Unauthorized | Your API Key is missing, revoked, or incorrect. |
| **400** | Bad Request | You didn't send a "tag" or a "url" in the body. |
| **500** | Server Error | Something went wrong with the database connection. |