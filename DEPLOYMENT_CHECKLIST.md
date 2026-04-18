# Deployment Checklist for Next.js Optimizer Suite

## Before Deployment

### Security
- [ ] Generate strong API_SECRET_KEY (32+ characters, random)
- [ ] Change default API key from development value
- [ ] Update CORS origins to Android app domain (not *)
- [ ] Enable HTTPS (required for production)
- [ ] Remove any console.log statements with sensitive data

### Configuration
- [ ] Set NODE_ENV=production in .env.production
- [ ] Configure proper Base URL for production
- [ ] Set up rate limiting (recommended: 100 requests/minute)
- [ ] Configure logging/monitoring service

### Testing
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Test health endpoint returns 200
- [ ] Test revalidate returns 401 without API key
- [ ] Test revalidate returns 200 with correct API key
- [ ] Load test with 100+ concurrent requests

### Deployment Platforms

#### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod