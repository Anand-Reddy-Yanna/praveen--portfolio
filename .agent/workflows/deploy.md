---
description: How to deploy the Praveen Portfolio website to production
---

# Portfolio Deployment Guide

This guide covers deploying the portfolio website to various platforms.

## Prerequisites

- Node.js 18+ installed
- npm installed
- Git installed (for most deployment methods)

## Build for Production

// turbo
1. Build the project:
```bash
npm run build
```

This creates a `dist/` folder with the production bundle.

## Option 1: Deploy to Railway (Recommended - Free Tier)

Railway provides a simple way to deploy full-stack Node.js apps.

1. Create an account at [railway.app](https://railway.app)
2. Install the Railway CLI:
```bash
npm install -g @railway/cli
```
3. Login and deploy:
```bash
railway login
railway init
railway up
```
4. Railway will auto-detect the Node.js app and deploy it.
5. Set the `PORT` environment variable to `5000` in the Railway dashboard if needed.

## Option 2: Deploy to Render (Free Tier)

1. Create an account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` or `node dist/index.js`
   - **Environment**: Node
5. Add environment variable: `NODE_ENV=production`
6. Deploy

## Option 3: Deploy to Vercel

> **Note**: Vercel is optimized for frontend frameworks. For full-stack with Express, you may need to adapt the server to use Vercel serverless functions. This is more complex but works well for the frontend portion.

1. Install Vercel CLI:
```bash
npm install -g vercel
```
2. Deploy:
```bash
vercel
```

## Option 4: Deploy to VPS (DigitalOcean, AWS, etc.)

1. SSH into your server
2. Clone the repository
3. Install dependencies and build:
```bash
npm install
npm run build
```
4. Use PM2 to run the server:
```bash
npm install -g pm2
pm2 start dist/index.js --name portfolio
pm2 save
pm2 startup
```
5. Set up Nginx as a reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
6. Enable HTTPS with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Important Notes

- **Session Secret**: Change the `portfolio-secret-key-change-in-prod` in `server/auth.ts` to a secure random string before deploying.
- **Database**: The app currently uses in-memory storage. Data will be lost on server restart. For production, consider connecting to PostgreSQL or MongoDB.
- **Environment Variables**: Set `NODE_ENV=production` on your hosting platform.
- **Admin Credentials**: Change the default admin password (`admin123`) after first login.
