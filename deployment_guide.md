# Full-Stack Deployment Guide (Django Backend + React Frontend)

This guide covers deploying both the Django backend and the React (Vite) frontend for your project.

---

## 1. Server Setup (Ubuntu Example)

Update your system and install required packages:

```bash
sudo apt update
sudo apt upgrade
sudo apt install python3-pip python3-venv nginx
```

---

## 2. Project Structure

Your project directory looks like this:

```
To-Do-App/
  backend/      # Django backend
  frontend/     # React (Vite) frontend
  config.json   # Backend config
  deployment_guide.md
```

---

## 3. Backend Setup (Django)

### a. Clone and Prepare Backend

```bash
# Go to your deployment directory
mkdir /var/www/todo-app
cd /var/www/todo-app

git clone https://github.com/hanihashmi786/To-Do-App.git .

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### b. Configuration

Your backend uses a `config.json` file in the project root. Example for **local development**:

```json
{
    "SECRET_KEY": "your-secret-key",
    "DEBUG": true,
    "ALLOWED_HOSTS": ["127.0.0.1", "localhost"]
}
```

For **production**, use your real domain(s):

```json
{
    "SECRET_KEY": "your-secret-key",
    "DEBUG": false,
    "ALLOWED_HOSTS": ["your.domain.com"]
}
```

- **SECRET_KEY**: Your Django secret key.
- **DEBUG**: Set to `false` for production.
- **ALLOWED_HOSTS**: List of allowed hosts/domains.

### c. Django Settings Highlights
- `SECRET_KEY`, `DEBUG`, and `ALLOWED_HOSTS` are loaded from `config.json`.
- Default DB is SQLite (`db.sqlite3` in backend/). To use PostgreSQL or another DB, update `DATABASES` in `backend/core/settings.py` and add credentials to `config.json`.
- Static files: `STATIC_URL = 'static/'`. Collected to `backend/staticfiles/` for deployment.
- Media files: `MEDIA_URL = '/media/'`, `MEDIA_ROOT = backend/media/`.
- CORS is enabled for all origins (for development; restrict in production).

### d. Collect Static Files

```bash
python manage.py collectstatic
```
This gathers all static files into `backend/staticfiles/`.

---

## 4. Frontend Setup (React + Vite)

### a. Build Frontend

```bash
cd ../frontend
npm install
npm run build
```

- The production build will be in `frontend/dist/`.

### b. Serve Frontend

You can serve the built frontend using Nginx (recommended) or another static file server. See Nginx config below.

### c. Configure Frontend API Base URL

Create a `.env` file in your `frontend/` directory with:

```
VITE_API_BASE_URL=http://localhost:8000/api/
```
- For production, set this to your deployed backend URL (e.g., `https://your.domain.com/api/`).
- **Restart the Vite dev server after changing `.env`**:
  ```bash
  npm run dev
  ```

---

## 5. Gunicorn Setup (Backend WSGI Server)

**Create a Gunicorn systemd service file:**

```bash
pip install gunicorn
sudo nano /etc/systemd/system/gunicorn_todoapp.service
```

Paste the following (update paths as needed):

```ini
[Unit]
Description=Gunicorn daemon for To-Do App Django Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/todo-app/backend
Environment="PATH=/var/www/todo-app/backend/venv/bin"
ExecStart=/var/www/todo-app/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/todo-app/backend/backend.sock core.wsgi:application

[Install]
WantedBy=multi-user.target
```

Enable and start Gunicorn:

```bash
sudo systemctl start gunicorn_todoapp
sudo systemctl enable gunicorn_todoapp
sudo systemctl status gunicorn_todoapp
```

Restart Gunicorn after code/config changes:

```bash
sudo systemctl restart gunicorn_todoapp
```

---

## 6. Nginx Setup (Reverse Proxy & Static Serving)

Create and edit the Nginx config for your domain/subdomain:

```bash
sudo nano /etc/nginx/sites-available/todoapp
```

Paste the following (adjust paths and server_name):

```nginx
server {
    listen 80;
    server_name your.domain.com;

    # Serve frontend (React build)
    location / {
        root /var/www/todo-app/frontend/dist;
        try_files $uri /index.html;
    }

    # Serve Django static files
    location /static/ {
        alias /var/www/todo-app/backend/staticfiles/;
    }

    # Serve Django media files
    location /media/ {
        alias /var/www/todo-app/backend/media/;
    }

    # Proxy API requests to Django backend
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/todo-app/backend/backend.sock;
    }
}
```

Enable your site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/todoapp /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. Database

- Default: SQLite (`backend/db.sqlite3`).
- For PostgreSQL or others, update `DATABASES` in `backend/core/settings.py` and add credentials to `config.json`.

---

## 8. Final Steps

- Run migrations:

  ```bash
  cd backend
  python manage.py migrate
  ```

- Create a superuser (optional):

  ```bash
  python manage.py createsuperuser
  ```

- Set permissions:

  ```bash
  sudo chown -R www-data:www-data /var/www/todo-app
  sudo chmod -R 755 /var/www/todo-app
  ```

---

## 9. SSL (Recommended)

Set up SSL with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your.domain.com
```

---

## 10. Directory Structure Reference

- `backend/core/settings.py` – Django settings (reads from `config.json`)
- `config.json` – Backend configuration file
- `backend/staticfiles/` – Collected static files (for deployment)
- `backend/media/` – Uploaded media files
- `frontend/dist/` – Production build of React frontend

---

## 11. API/Frontend Integration Notes

- By convention, Django API endpoints should be prefixed (e.g., `/api/`). Adjust your frontend API URLs accordingly.
- CORS is enabled for all origins in development. **For production, restrict CORS:**
  ```python
  # In backend/core/settings.py for production:
  CORS_ALLOW_ALL_ORIGINS = False
  CORS_ALLOWED_ORIGINS = [
      "https://your.domain.com",
  ]
  ```
- **After changing `config.json` or `.env`, restart the backend or frontend server as appropriate.**

---

**You now have a full-stack deployment with Django (backend) and React (frontend) on a single server!**