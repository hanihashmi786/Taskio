# 🚀 Quick Start Guide - Taskio

## Local Development Setup

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Git installed

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Mac/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server:**
   ```bash
   python manage.py runserver
   ```

   Backend will run at: `http://localhost:8000`

### Frontend Setup

1. **Open new terminal and navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a file named `.env` in the `frontend` directory:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run at: `http://localhost:5173`

### Access the App

Open your browser and go to: `http://localhost:5173`

---

## 🌐 Deploy to Production

Ready to make your app live? Check out the **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions on deploying to:

- Render (Free, Recommended)
- Railway ($5/month credit)
- Vercel + Render

---

## 📝 Environment Variables

### Backend (via config.json or Environment Variables)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (true/false)
- `ALLOWED_HOSTS` - Comma-separated list of allowed domains
- `DATABASE_URL` - PostgreSQL connection URL (auto-set by hosting platforms)

### Frontend (via .env file)
- `VITE_API_BASE_URL` - Backend API URL

---

## 🔧 Common Commands

### Backend
```bash
# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

### Frontend
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📚 Tech Stack

- **Backend:** Django 5.0.2, Django REST Framework, PostgreSQL
- **Frontend:** React 19, Vite, TailwindCSS
- **Auth:** JWT (JSON Web Tokens)
- **Drag & Drop:** @dnd-kit
- **State Management:** Zustand

---

## 🎯 Features

- 🔐 User authentication (JWT)
- 📋 Kanban boards with drag-and-drop
- ✅ Task cards with checklists
- 💬 Comments on tasks
- 📎 File attachments
- 🏷️ Labels and tags
- 👥 Board members & collaboration
- 🔔 Real-time notifications
- 🎨 Custom backgrounds & themes
- 📱 Responsive design

---

## 🆘 Need Help?

- Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment issues
- Review the code in `backend/core/settings.py` for configuration
- Check browser console for frontend errors
- Check backend terminal logs for API errors

---

Happy task managing! 🎉

