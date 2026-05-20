# Vercel + Render Deployment

This project is now set up to deploy as:

- `Frontend`: static Vite site on Vercel
- `Backend`: Node/Express API on Render

## 1. Backend on Render

Create a Render `Web Service` for this repo.

Use these settings:

- `Name`: `praveen-portfolio-api`
- `Runtime`: `Node`
- `Build Command`: `npm install && npm run build:server`
- `Start Command`: `npm run start:server`

Set these environment variables in Render:

- `NODE_ENV=production`
- `SERVE_FRONTEND=false`
- `MONGODB_URI=<your mongo connection string>`
- `SESSION_SECRET=<generate a strong random value>`
- `FRONTEND_URL=https://your-vercel-domain.vercel.app`
- `ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app`

If you later add a custom frontend domain, include both origins in `ALLOWED_ORIGINS` as a comma-separated list.

Example:

```env
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://portfolio.yourdomain.com
```

After deploy, your backend URL will look like:

```txt
https://praveen-portfolio-api.onrender.com
```

## 2. Frontend on Vercel

Create a Vercel project from the same repo.

Use these settings:

- `Framework Preset`: `Vite`
- `Build Command`: `npm run build:client`
- `Output Directory`: `dist/public`

Set this environment variable in Vercel:

```env
VITE_API_BASE_URL=https://praveen-portfolio-api.onrender.com
```

The included `vercel.json` rewrites all frontend routes to `index.html`, which is required for SPA routes like `/projects`, `/login`, and `/admin`.

## 3. Admin login and cookies

The backend now sends production cookies with:

- `Secure=true`
- `SameSite=None`
- `HttpOnly=true`

That is required because Vercel and Render are separate origins.

## 4. Deploy order

1. Deploy the backend on Render first.
2. Copy the Render backend URL.
3. Add that URL to `VITE_API_BASE_URL` in Vercel.
4. Add the Vercel frontend URL to `FRONTEND_URL` and `ALLOWED_ORIGINS` in Render.
5. Redeploy both services once after env vars are set.

## 5. Local development

Local development still works with:

```bash
npm run dev
```

That runs the existing combined dev server.

## 6. Notes

- Render free/starter instances can sleep, so the first API request may be slow.
- Session storage is still in memory, so admin sessions reset on backend restart or redeploy.
- If you want persistent admin sessions across deploys, the next step is moving sessions to Redis or Mongo-backed session storage.
