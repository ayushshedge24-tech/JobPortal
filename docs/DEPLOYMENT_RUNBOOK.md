# JobPortal 2.0 — Production Deployment Runbook

This guide details the step-by-step procedure for deploying, configuring, monitoring, and rolling back JobPortal 2.0 in production environments.

---

## 1. System Architecture Overview

```
[ Client / CDN ] ---> [ Nginx / Cloudflare Load Balancer ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Express API Node 1 ]            [ Express API Node 2 ]
            │                                 │
            └────────────────┬────────────────┘
                             ▼
               [ MongoDB Cluster / ReplicaSet ]
```

---

## 2. Prerequisites & Minimum Requirements

* **Node.js**: v20.x or v22.x LTS (tested up to Node v24)
* **MongoDB**: v6.0 or v7.0 (ReplicaSet recommended for transactions and change streams)
* **Process Manager**: PM2, Systemd, or Kubernetes
* **Reverse Proxy**: Nginx, Caddy, or AWS ALB with SSL/TLS termination
* **Memory**: Minimum 2 GB RAM per Node API instance, 4 GB RAM for MongoDB

---

## 3. Environment Configuration

Create `.env` in the server directory (or inject via Kubernetes Secret / AWS Parameter Store):

```env
# Server Runtime
PORT=5000
NODE_ENV=production

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobportal?retryWrites=true&w=majority

# Authentication Secrets (Generate strong random 64-char keys)
JWT_SECRET=production_strong_random_jwt_secret_key_at_least_64_chars_long
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=production_strong_random_refresh_secret_key_at_least_64_chars_long

# CORS & Domain Boundaries
CLIENT_URL=https://jobportal.yourdomain.com
```

> [!IMPORTANT]
> Never commit `.env` or secrets to version control. Server-only secrets (`JWT_SECRET`, `MONGODB_URI`) must never be prefixed with `VITE_` to prevent bundling into client code.

---

## 4. Backend Deployment Steps

1. **Clone repository and install production dependencies:**
   ```bash
   cd /var/www/jobportal/server
   npm ci --omit=dev
   ```

2. **Verify Database Indexes & Syntax:**
   ```bash
   node index.js --check-syntax
   ```

3. **Start backend cluster with PM2:**
   ```bash
   pm2 start index.js --name "jobportal-api" -i max --max-memory-restart 500M
   pm2 save
   pm2 startup
   ```

---

## 5. Frontend Build & Static Deployment

1. **Install and compile optimized assets:**
   ```bash
   cd /var/www/jobportal/client
   npm ci
   npm run build
   ```

2. **Deploy output to web server:**
   * Build output directory: `client/dist/`
   * Copy to Nginx web root or deploy to Cloudflare Pages / AWS S3 + CloudFront.

3. **Nginx SPA Routing Configuration Example:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name jobportal.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/jobportal.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/jobportal.yourdomain.com/privkey.pem;

       root /var/www/jobportal/client/dist;
       index index.html;

       # Frontend SPA Fallback
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Backend API Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

## 6. Health & Liveness Verification

* Execute HTTP GET probe against API health endpoint:
  ```bash
  curl -I https://jobportal.yourdomain.com/api/health
  ```
  Expected response:
  ```json
  {
    "status": "ok",
    "service": "jobportal-api",
    "version": "2.0.0",
    "timestamp": "2026-09-21T18:00:00.000Z",
    "uptime": 120.4
  }
  ```

---

## 7. Rollback Procedure

If a critical issue occurs during release deployment:

1. **Frontend Rollback:**
   * Point Nginx / CDN back to previous release folder (`client/dist-prev/` or previous commit build).
2. **Backend Rollback:**
   ```bash
   cd /var/www/jobportal/server
   git checkout <PREVIOUS_STABLE_TAG>
   npm ci --omit=dev
   pm2 restart jobportal-api
   ```
3. **Database Considerations:**
   * Schemas maintain non-destructive backward compatibility. No data destruction will occur upon rolling back server code.

---

## 8. Database Backup Strategy

1. **Automated Daily Snapshot:**
   ```bash
   mongodump --uri="$MONGODB_URI" --gzip --archive=/backups/jobportal_$(date +%Y%m%d_%H%M%S).gz
   ```
2. **Retention Policy:**
   * Keep daily backups for 30 days, weekly backups for 90 days, monthly backups for 1 year in isolated AWS S3 / Google Cloud Storage buckets with Object Lock enabled.
