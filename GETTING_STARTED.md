# Getting Started with Elite Hub

## Quick Start Guide

### Prerequisites
- Node.js v14+ and npm
- MongoDB (local or MongoDB Atlas account)
- A text editor or IDE (VS Code recommended)
- Git (optional)

## Step 1: Clone/Download the Project

```bash
# If using git
git clone <repository-url>
cd elite-hub-website

# Or extract the downloaded ZIP file
```

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd backend
npm install
```

### 2.2 Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Windows: type .env
# Mac/Linux: cat .env
```

### 2.3 Start MongoDB
**Option A: Local MongoDB**
```bash
# Windows (if installed)
mongod

# Mac (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### 2.4 Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Expected output:
```
Elite Hub server running on port 5000
MongoDB connected successfully
```

## Step 3: Frontend Setup

### Option A: Using HTTP Server (Recommended for development)
```bash
# Navigate to frontend directory
cd frontend

# Using Python (Mac/Linux)
python -m http.server 3000

# Or using Node.js
npx http-server -p 3000
```

Then open: `http://localhost:3000`

### Option B: Open in Browser Directly
```bash
# Navigate to frontend folder
# Right-click on index.html
# Select "Open with" → your browser
```

## Step 4: Test the Application

### Test Frontend
1. Open `http://localhost:3000` (or file path)
2. Click through different pages
3. Test mobile responsiveness (F12 → Toggle device toolbar)

### Test Backend API
```bash
# In another terminal/PowerShell
curl http://localhost:5000/api

# Expected response:
# {"message":"Elite Hub API Server","version":"1.0.0"}
```

## First Time Login

### Create a Test Student Account
1. Go to `http://localhost:3000/pages/login.html`
2. Note: Registration is for demo (implement auth in dashboard)
3. Or use demo credentials (to be set up)

### Access Student Dashboard
1. Login with your credentials
2. View dashboard at `/pages/dashboard.html`

## File Structure Overview

```
📁 elite-hub-website/
├── 📁 frontend/
│   ├── index.html (Home page)
│   ├── 📁 pages/ (All other pages)
│   ├── 📁 assets/
│   │   ├── 📁 css/ (Styling)
│   │   └── 📁 js/ (JavaScript)
│   └── ... (other HTML files)
│
├── 📁 backend/
│   ├── server.js (Main server)
│   ├── package.json (Dependencies)
│   ├── .env.example (Config template)
│   ├── 📁 models/ (Database schemas)
│   ├── 📁 routes/ (API endpoints)
│   ├── 📁 config/ (Configuration)
│   └── 📁 middleware/ (Auth, validation)
│
└── README.md (Full documentation)
```

## Common Tasks

### Add a New Page
1. Create HTML file in `/frontend/pages/`
2. Link to it from navigation menu
3. Import styles and scripts

### Add a Quiz
1. Login as admin (to be implemented)
2. Go to admin dashboard
3. Click "Create Quiz"
4. Add questions and publish

### Upload Study Material
1. Login as admin
2. Go to "Manage Resources"
3. Upload PDF or document
4. Select subject, form, and topic
5. Save

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Start MongoDB service
- Or use MongoDB Atlas and update `MONGODB_URI`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Pages Not Loading
- Clear browser cache (Ctrl+Shift+Del)
- Check file paths are correct
- Check JavaScript console (F12) for errors
- Ensure server is running on correct port

### CORS Errors
- Check backend is running (`http://localhost:5000`)
- Update frontend API calls to use correct URL
- Backend has CORS enabled by default

## Next Steps

### Implement Authentication
- [ ] Add JWT token generation
- [ ] Protect admin routes
- [ ] Add session management
- [ ] Implement forgot password

### Add Database Features
- [ ] Connect registration to database
- [ ] Store quiz results
- [ ] Save assignments to database
- [ ] Track student progress

### Enhance Features
- [ ] Add file upload for assignments
- [ ] Implement email notifications
- [ ] Add discussion forums
- [ ] Create analytics dashboard

### Prepare for Production
- [ ] Set up HTTPS
- [ ] Configure domain
- [ ] Use environment variables
- [ ] Set up CI/CD pipeline
- [ ] Add error logging
- [ ] Backup database regularly

## Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- MongoDB for VS Code
- REST Client
- Thunder Client

### API Testing Tools
- Postman (https://www.postman.com)
- Thunder Client
- Insomnia

### Database Management
- MongoDB Compass
- MongoDB Atlas web interface

## Getting Help

### Documentation
- Read [README.md](README.md) for full API docs
- Check route files in `/backend/routes/`
- Review model files in `/backend/models/`

### Resources
- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [MDN Web Docs](https://developer.mozilla.org)

### Contact
- Email: tutor@elitehub.com
- WhatsApp: +1 (555) 123-4567

## Important Notes

⚠️ **Before Going to Production:**
1. Change all default passwords
2. Update JWT_SECRET to a strong key
3. Set NODE_ENV to 'production'
4. Use HTTPS only
5. Validate all user inputs
6. Set up proper error handling
7. Configure proper CORS
8. Backup your database regularly
9. Monitor server logs
10. Keep dependencies updated

---

Happy learning with Elite Hub! 🎓
