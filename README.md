# To-Do/Kanban App

This project is a full-stack productivity application designed to help individuals and teams organize tasks, track progress, and collaborate efficiently. Built with a Django REST API backend and a React (Vite) frontend, it provides a modern Kanban board interface where users can create boards, add cards, manage checklists, leave comments, and attach files. The app supports user authentication to ensure data privacy and personalized workspaces. Its purpose is to streamline task management, improve workflow visibility, and enhance team communication, making it suitable for personal use, small teams, or larger organizations seeking a customizable productivity solution.

---

## 🚀 Tech Stack
- **Backend:** Django, Django REST Framework, PostgreSQL (production), SQLite (local)
- **Frontend:** React (Vite), modern JavaScript/JSX
- **Deployment:** Gunicorn, Nginx, systemd, Certbot (SSL)

---

## 📁 Project Structure
```
To-Do-App/
  backend/      # Django backend
    accounts/   # User accounts app
    kanban/     # Kanban board app
    core/       # Django project settings
    manage.py   # Django management script
    requirements.txt
    config.json # Backend config (see below)
  frontend/     # React (Vite) frontend
    src/        # React source code
    public/
    package.json
    vite.config.js
  venv/         # Python virtual environment (not tracked)
```

---

## ⚡ Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/hanihashmi786/To-Do-App.git
cd To-Do-App
```

### 2. Backend Setup (Django)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Create `config.json` in `backend/` for local dev:
```json
{
  "SECRET_KEY": "your-local-secret-key",
  "DEBUG": true,
  "ALLOWED_HOSTS": ["127.0.0.1", "localhost"]
}
```

#### Run migrations and start the server:
```bash
python manage.py migrate
python manage.py createsuperuser  # (optional, for admin access)
python manage.py runserver
```

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
```

#### Create `.env` in `frontend/`:
```
VITE_API_BASE_URL=http://localhost:8000/api/
```

#### Start the frontend dev server:
```bash
npm run dev
```

- The app will be available at [http://localhost:5173](http://localhost:5173)
- The backend API runs at [http://localhost:8000/api/](http://localhost:8000/api/)

---

## 🗄️ Database Configuration
- **Local:** Uses SQLite by default (no extra setup needed)
- **Production:** Uses PostgreSQL (see deployment guide)
- The backend reads DB config from `backend/config.json`. If DB fields are omitted, SQLite is used.

---

## 🛠️ Building for Production

### Backend
- Collect static files:
  ```bash
  python manage.py collectstatic
  ```
- Use Gunicorn + Nginx for serving in production (see deployment_guide2.md)

### Frontend
- Build the production bundle:
  ```bash
  npm run build
  ```
- Serve the `frontend/dist/` directory with Nginx or any static file server

---

## 🤝 Contributing
1. Fork the repo and clone your fork
2. Create a new branch for your feature or bugfix
3. Make your changes (with clear, descriptive commits)
4. Push to your fork and open a Pull Request
5. Please follow the existing code style and add tests where appropriate

---

## 📚 Resources
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---
