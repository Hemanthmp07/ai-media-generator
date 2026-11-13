# 🚀 Deployment & Production Guide

## Production Deployment Steps

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API keys secured
- [ ] CORS settings updated
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Performance optimized

### Backend Deployment Options

#### Option 1: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=5000

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option 2: Railway.app

```bash
# Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 3: AWS Lambda

```bash
# Using Serverless Framework
npm install -g serverless

# Configure AWS credentials
serverless config credentials --provider aws

# Deploy
serverless deploy
```

#### Option 4: DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean App Platform
3. Connect repository
4. Set environment variables
5. Deploy automatically

### Frontend Deployment Options

#### Option 1: Vercel (Recommended for React)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel
```

**Advantages:**
- Instant deployments
- Automatic SSL
- Preview URLs for PRs
- Analytics included

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=frontend/dist
```

#### Option 3: GitHub Pages

```bash
# Update package.json homepage
"homepage": "https://yourusername.github.io/ai-media-generator"

# Add deployment scripts
# Configure GitHub Actions for CI/CD
```

### Environment Setup

**Backend .env (Production):**
```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
DATABASE_URL=your_database_url
API_TIMEOUT=30000
LOG_LEVEL=error
```

**Frontend Configuration:**
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=AI Media Generator
VITE_ANALYTICS_KEY=your_analytics_key
```

### Database Migration

**From In-Memory to SQLite (Development):**

```bash
cd backend
npm install sqlite3
```

Create `backend/db/migration.js`:
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ai_media.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      type TEXT,
      prompt TEXT,
      timestamp DATETIME,
      data JSON
    )
  `);
});
```

**From In-Memory to MongoDB (Production):**

```bash
cd backend
npm install mongodb
```

Create `backend/db/mongo.js`:
```javascript
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
// Connect and setup collections
```

### Performance Optimization

**Frontend:**
```javascript
// Code splitting
const ImageGenerator = lazy(() => import('./components/ImageGenerator'));
const VideoGenerator = lazy(() => import('./components/VideoGenerator'));

// Image optimization
<img loading="lazy" src={...} />

// Build optimization
// vite.config.js
build: {
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'axios', 'tailwindcss']
      }
    }
  }
}
```

**Backend:**
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Response compression
const compression = require('compression');
app.use(compression());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

### Security Hardening

1. **Helmet.js** - Security headers
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

2. **Rate Limiting**
```bash
npm install express-rate-limit
```

3. **Input Validation** - Already using Zod ✓

4. **CORS Configuration**
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

5. **Environment Secrets**
- Never commit `.env` files
- Use `.env.example` as template
- Rotate API keys regularly
- Use managed secrets (GitHub Secrets, Heroku Config Vars)

### Monitoring & Logging

**Backend Logging:**
```bash
npm install winston
```

```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

**Frontend Analytics:**
```bash
npm install @segment/analytics-next
```

**Error Tracking:**
- Sentry
- Rollbar
- LogRocket

### CI/CD Pipeline

**GitHub Actions Example:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: cd backend && npm install
      - run: cd backend && npm test
      
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      
      - name: Deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod
```

### Performance Benchmarks

**Target Metrics:**
- Image generation: < 5 seconds
- Page load: < 2 seconds
- API response: < 200ms
- Gallery load: < 1 second

### Scaling Considerations

**Phase 1 (0-1000 users):**
- Single backend server
- Local database
- CDN for static assets

**Phase 2 (1000-10,000 users):**
- Load balancer
- Database replication
- Redis cache layer
- Separate API servers

**Phase 3 (10,000+ users):**
- Kubernetes orchestration
- Database clustering
- Microservices architecture
- Message queues (RabbitMQ)
- Distributed caching

### Domain Setup

**DNS Configuration:**
```
api.yourdomain.com → Backend API Server
yourdomain.com → Frontend CDN
www.yourdomain.com → Frontend CDN
```

**SSL Certificate:**
- Use Let's Encrypt (free)
- Auto-renew certificates
- HTTPS only in production

### Backup Strategy

```bash
# Daily backups
0 2 * * * /backup/backup.sh

# Weekly full backups
0 3 * * 0 /backup/full_backup.sh

# Store in S3 or similar
```

### Rollback Plan

1. Tag releases with version numbers
2. Keep previous version deployed
3. Quick DNS switch if needed
4. Database migration scripts reversible
5. Document rollback procedures

### Monitoring & Alerts

**Key Metrics:**
- Error rate
- Response time
- CPU/Memory usage
- Disk space
- API quota usage
- Database connections

**Alert Thresholds:**
- Error rate > 1%
- Response time > 1000ms
- CPU > 80%
- Memory > 90%
- Downtime > 1 minute

---

## Quick Deployment Commands

**Heroku:**
```bash
git push heroku main
```

**Vercel:**
```bash
cd frontend && vercel --prod
```

**Railway:**
```bash
railway up
```

**DigitalOcean:**
```bash
git push
# Automatic deployment via webhook
```

---

## Post-Deployment

1. ✅ Test all endpoints
2. ✅ Verify database connections
3. ✅ Check error logs
4. ✅ Monitor performance
5. ✅ Test edge cases
6. ✅ Update status page
7. ✅ Announce release

---

Made with ✨ - Ready for Production!
