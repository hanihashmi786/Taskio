# 🚀 Taskio Deployment Guide

Complete guide to deploy your Django backend and React frontend to make Taskio live!

## 📋 Table of Contents
- [Quick Overview](#quick-overview)
- [Option 1: Deploy to Render (Recommended)](#option-1-deploy-to-render-recommended)
- [Option 2: Deploy to Railway](#option-2-deploy-to-railway)
- [Option 3: Deploy to Vercel + Render](#option-3-deploy-to-vercel--render)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

---

## Quick Overview

**Tech Stack:**
- **Backend:** Django 5.0.2 + PostgreSQL
- **Frontend:** React 19 + Vite
- **Storage:** Media files (avatars, attachments, backgrounds)

**What You'll Need:**
- GitHub account (✅ Done - Taskio repo created!)
- Deployment platform account (Render/Railway/Vercel)
- About 15-20 minutes

---

## Option 1: Deploy to Render (Recommended) ⭐

Render offers free PostgreSQL database and easy deployment for both frontend and backend.

### Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect your Taskio repository**

4. **Configure the service:**
   - **Name:** `taskio-backend`
   - **Region:** Choose closest to your location
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
     ```
   - **Start Command:**
     ```bash
     gunicorn core.wsgi:application
     ```

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   SECRET_KEY=your-super-secret-key-here-change-this
   DEBUG=False
   ALLOWED_HOSTS=your-app-name.onrender.com
   PYTHON_VERSION=3.11.0
   ```

6. **Create PostgreSQL Database:**
   - Go to "New +" → "PostgreSQL"
   - Name it `taskio-db`
   - After creation, copy the **Internal Database URL**
   - Go back to your web service → Environment
   - Add: `DATABASE_URL=<paste-internal-database-url>`

7. **Click "Create Web Service"**

### Step 2: Deploy Frontend to Render

1. **Click "New +" → "Static Site"**

2. **Connect your Taskio repository**

3. **Configure:**
   - **Name:** `taskio-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`

4. **Add Environment Variable:**
   ```
   VITE_API_BASE_URL=https://taskio-backend.onrender.com
   ```
   *(Replace with your actual backend URL)*

5. **Click "Create Static Site"**

### Step 3: Update Backend Settings

After deployment, add your frontend URL to ALLOWED_HOSTS:
- Go to backend service → Environment
- Update `ALLOWED_HOSTS` to include your frontend URL:
  ```
  ALLOWED_HOSTS=taskio-backend.onrender.com,taskio-frontend.onrender.com
  ```

---

## Option 2: Deploy to Railway 🚂

Railway offers $5 free credit per month and is very beginner-friendly.

### Backend Deployment

1. **Go to [Railway.app](https://railway.app)** and sign in with GitHub

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select Taskio repository**

4. **Click "Add variables"** and add:
   ```
   SECRET_KEY=your-super-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=*.railway.app
   ```

5. **Add PostgreSQL:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set DATABASE_URL

6. **Configure Root Directory:**
   - Go to Settings → Change root directory to `backend`

7. **Add Start Command:**
   - Settings → Start Command:
     ```bash
     python manage.py migrate && python manage.py collectstatic --no-input && gunicorn core.wsgi:application
     ```

8. **Click "Deploy"**

### Frontend Deployment

1. **In the same project, click "New" → "GitHub Repo" → Select Taskio again**

2. **Add Environment Variable:**
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   ```

3. **Configure:**
   - Settings → Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

4. **Click "Deploy"**

---

## Option 3: Deploy to Vercel + Render 🌐

Best performance for frontend, but requires separate backend hosting.

### Backend on Render
Follow **Option 1, Step 1** above for backend deployment.

### Frontend on Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up with GitHub

2. **Click "Add New" → "Project"**

3. **Import Taskio repository**

4. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variable:**
   ```
   VITE_API_BASE_URL=https://taskio-backend.onrender.com
   ```

6. **Click "Deploy"**

---

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | Debug mode | `False` (always False in production) |
| `ALLOWED_HOSTS` | Allowed domains | `your-app.onrender.com,your-app.vercel.app` |
| `DATABASE_URL` | PostgreSQL URL | Usually auto-set by hosting platform |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://taskio-backend.onrender.com` |

---

## Post-Deployment Checklist ✅

### 1. Create Superuser
SSH into your backend or use the platform's console:
```bash
python manage.py createsuperuser
```

### 2. Test Your App
- Visit your frontend URL
- Try signing up
- Create a board
- Upload an attachment

### 3. Configure CORS (if needed)
If you get CORS errors, update `backend/core/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-url.vercel.app',
    'https://your-frontend-url.onrender.com',
]
```

### 4. Update config.json
Your production `backend/config.json` should look like:
```json
{
    "SECRET_KEY": "env-variable-will-override-this",
    "DEBUG": false,
    "ALLOWED_HOSTS": ["your-backend.onrender.com"]
}
```

### 5. Media Files Storage (Important!)

**⚠️ Warning:** Free hosting platforms don't persist uploaded files!

For production, you need cloud storage:

#### Option A: Cloudinary (Recommended for images)
```bash
pip install cloudinary django-cloudinary-storage
```

Add to `settings.py`:
```python
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'your_cloud_name',
    'API_KEY': 'your_api_key',
    'API_SECRET': 'your_api_secret'
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

#### Option B: AWS S3
```bash
pip install boto3 django-storages
```

Add to `settings.py`:
```python
AWS_ACCESS_KEY_ID = 'your-access-key'
AWS_SECRET_ACCESS_KEY = 'your-secret-key'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

---

## Troubleshooting 🔧

### Backend won't start?
- Check logs in your hosting platform
- Verify all environment variables are set
- Make sure `requirements.txt` includes `gunicorn` and `psycopg2-binary`

### Frontend can't connect to backend?
- Check `VITE_API_BASE_URL` is correct
- Verify CORS settings in Django
- Check browser console for errors

### Database errors?
- Run migrations: `python manage.py migrate`
- Check DATABASE_URL is set correctly

### Static files not loading?
- Run `python manage.py collectstatic`
- Check STATIC_ROOT and STATIC_URL in settings.py

---

## 🎉 You're Live!

Once deployed, your Taskio app will be accessible at:
- **Frontend:** `https://your-app-name.vercel.app` (or `.onrender.com`)
- **Backend API:** `https://your-backend.onrender.com`

Share the link with friends and start managing tasks! 🚀

---

## Cost Breakdown 💰

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Render** | 750 hours/month + PostgreSQL | Full-stack apps (Backend + Frontend) |
| **Railway** | $5 credit/month | Quick deployment |
| **Vercel** | Unlimited for personal | Frontend only |
| **Heroku** | No free tier | Not recommended |

**Recommended:** Render for both (100% free) or Vercel (Frontend) + Render (Backend)

