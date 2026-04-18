# Next.js Optimizer Suite - API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication
All protected endpoints require an API key in the Authorization header:


Authorization: Bearer YOUR_API_KEY

## Endpoints

### 1. Health Check
**GET** `/api/health`

No authentication required.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-18T10:25:47.053Z",
  "uptime": {
    "seconds": 11,
    "minutes": 0,
    "hours": "0.00"
  },
  "memory": {
    "rss": 522764288,
    "heapTotal": 200998912,
    "heapUsed": 63262776,
    "external": 4157434
  },
  "environment": "production",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "revalidate": "/api/revalidate"
  }
}


2. Cache Revalidation
POST /api/revalidate

Requires authentication.

Request Body (provide either path or tag):

json
{
  "path": "/products/123"
}
OR

json
{
  "tag": "products"
}
Response (200 OK):

json
{
  "success": true,
  "revalidated": {
    "type": "path",
    "value": "/products/123"
  },
  "timestamp": "2026-04-18T10:26:00.000Z"
}
Error Responses:

401 Unauthorized - Missing or invalid API key

400 Bad Request - Invalid request body

500 Internal Server Error - Server error