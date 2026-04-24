# NexPulse API Reference

This guide covers how to integrate your machines (Apps/Servers) with the NexPulse engine.

## Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://github.com/inkand-paper/Optimizer` (Your deployed instance)

## Authentication

All "Machine" endpoints require an API Key issued from your NexPulse dashboard.

**Header**:
```http
Authorization: Bearer opt_your_api_key_here
```

## Endpoints

### 1. Engine Pulse (Health)
**GET** `/api/health`

Returns the operational status and memory metrics of the NexPulse engine. No key required.

### 2. Global Revalidation
**POST** `/api/revalidate`

Triggers an instant cache purge for a specific tag or path across your connected web properties.

**Request Payload**:
```json
{
  "tag": "products"
}
```

### 3. On-Demand Audit
**POST** `/api/analyze`

Triggers a deep-scan of any public URL for SEO, Security, and Performance.

**Request Payload**:
```json
{
  "url": "https://google.com"
}
```

## Response Codes

| Code | Status | Meaning |
| :--- | :--- | :--- |
| **200** | Success | Request processed and pulse sent. |
| **401** | Unauthorized | Your API Key is missing, revoked, or invalid. |
| **400** | Bad Request | Missing required parameters (`tag` or `url`). |
| **500** | Error | Engine failure or database connection timeout. |