# Elite Hub - Quick Reference Guide

## 🚀 Start Here

### Frontend (No setup needed)
```bash
# Open in browser directly (frontend only)
file:///path/to/elite-hub-website/frontend/index.html

# Or run a local server
cd frontend
python -m http.server 3000
# Then visit: http://localhost:3000
```

### Full Stack Setup
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm install
npm run dev
# Runs on: http://localhost:5000

# Terminal 3: Start Frontend
cd frontend
python -m http.server 3000
# Runs on: http://localhost:3000
```

---

## 📄 Page Guide

| Page | Path | Purpose |
|------|------|---------|
| Home | `/index.html` | Welcome & navigation |
| Subjects | `/pages/subjects.html` | Browse by subject/form |
| Resources | `/pages/resources.html` | Study materials |
| Quizzes | `/pages/quizzes.html` | Practice tests |
| Announcements | `/pages/announcements.html` | Updates & news |
| Contact | `/pages/contact.html` | Message tutor |
| Student Login | `/pages/login.html` | Student access |
| Admin Login | `/pages/admin-login.html` | Tutor access |
| Dashboard | `/pages/dashboard.html` | Student area |

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     - Register student
POST   /api/auth/login        - Login student
```

### Data Management
```
GET    /api/students          - List students
GET    /api/subjects          - List subjects
GET    /api/quizzes           - List quizzes
GET    /api/assignments       - List assignments
GET    /api/resources         - List resources
GET    /api/announcements     - List announcements

GET    /api/{resource}/:id    - Get single item
POST   /api/{resource}        - Create item
PUT    /api/{resource}/:id    - Update item
DELETE /api/{resource}/:id    - Delete item
```

---

## 📚 Database Models

### Student
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  form: String (Form 1-4),
  enrolledSubjects: [ObjectId],
  quizResults: [Object],
  assignments: [ObjectId],
  createdAt: Date
}
```

### Subject
```javascript
{
  name: String (Math, Physics, etc.),
  description: String,
  forms: [String],
  topics: [Object],
  teacher: ObjectId
}
```

### Quiz
```javascript
{
  title: String,
  subject: ObjectId,
  form: String,
  questions: [Object],
  totalPoints: Number,
  published: Boolean
}
```

### Assignment
```javascript
{
  title: String,
  subject: ObjectId,
  form: String,
  dueDate: Date,
  submissions: [Object],
  totalPoints: Number
}
```

### Resource
```javascript
{
  title: String,
  type: String (notes, past-paper, etc.),
  subject: ObjectId,
  form: String,
  fileUrl: String,
  downloadCount: Number
}
```

### Announcement
```javascript
{
  title: String,
  content: String,
  category: String (important, resource, etc.),
  targetForms: [String],
  author: ObjectId,
  createdAt: Date
}
```

---

## 🎨 Design System

### Colors
- **Primary**: Deep Blue (#003d82)
- **Secondary**: Green (#16a34a)
- **Accent**: Gold (#fbbf24)
- **Light**: Gray (#f3f4f6)

### Tailwind Classes Used
```html
<!-- Navigation -->
<nav class="bg-blue-900 text-white">

<!-- Cards -->
<div class="bg-white rounded-lg shadow-lg p-6">

<!-- Buttons -->
<button class="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800">

<!-- Forms -->
<input class="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500">
```

---

## 📱 Responsive Breakpoints

```css
Mobile First Approach:
- Default: Mobile (< 640px)
- sm: 640px
- md: 768px  /* Two-column layouts start here */
- lg: 1024px /* Three-column layouts start here */
- xl: 1280px
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in .env
- [ ] Use HTTPS in production
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Set secure CORS policies
- [ ] Hash passwords with bcryptjs
- [ ] Implement rate limiting
- [ ] Set security headers
- [ ] Backup database regularly
- [ ] Monitor error logs

---

## ⚡ Performance Tips

1. **Minimize HTTP Requests**: Combine CSS/JS files
2. **Image Optimization**: Use compressed images
3. **Caching**: Configure browser caching
4. **Database Indexes**: Index frequently searched fields
5. **CDN**: Use CDN for static assets
6. **Lazy Loading**: Load images on demand
7. **Minification**: Minify CSS/JS in production

---

## 🧪 Testing API Endpoints

### Using cURL (Command Line)
```bash
# Get all quizzes
curl http://localhost:5000/api/quizzes

# Get specific quiz
curl http://localhost:5000/api/quizzes/123

# Create quiz (with data)
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Quiz","subject":"123"}'
```

### Using Postman
1. Open Postman
2. Create new request
3. Set URL: `http://localhost:5000/api/quizzes`
4. Set method: GET/POST/PUT/DELETE
5. Add headers/body as needed
6. Click Send

---

## 🔄 Common Workflows

### Adding a New Subject
1. Go to admin panel (to be implemented)
2. Click "Add Subject"
3. Enter name, description, forms
4. Save to database
5. Subject appears in `/pages/subjects.html`

### Creating a Quiz
1. Admin dashboard → Create Quiz
2. Enter title, select subject/form
3. Add questions one by one
4. Set points per question
5. Publish when ready
6. Students can access on Quizzes page

### Uploading Resources
1. Admin dashboard → Upload Resource
2. Select resource type
3. Choose subject and form
4. Upload file
5. Resource appears in Study Resources page

### Posting Announcement
1. Admin dashboard → New Announcement
2. Enter title and content
3. Select target forms/subjects (optional)
4. Set category (important, resource, etc.)
5. Publish
6. Appears on Announcements page

---

## 📊 File Size Reference

- HTML pages: 5-15 KB each
- CSS (style.css): ~8 KB
- JavaScript (main.js): ~12 KB
- Tailwind CDN: ~50 KB (loaded once)

**Total Frontend: ~150 KB (uncompressed)**

---

## 🆘 Quick Troubleshoot

| Problem | Solution |
|---------|----------|
| Page not loading | Clear cache, check file paths |
| API not responding | Check backend is running, port correct |
| Database errors | Ensure MongoDB is running/connected |
| CSS not applied | Check Tailwind CDN is loaded |
| Form not submitting | Check JS functionality, console for errors |
| Images not showing | Verify file paths, check file exists |

---

## 📞 Support Resources

- **Documentation**: See README.md and GETTING_STARTED.md
- **Email**: tutor@elitehub.com
- **WhatsApp**: +1 (555) 123-4567
- **Web**: www.elitehub.com (when deployed)

---

## 📅 Development Timeline

- **Phase 1**: Frontend & Static Pages ✅
- **Phase 2**: Backend API Setup ✅
- **Phase 3**: Authentication Implementation
- **Phase 4**: Admin Dashboard
- **Phase 5**: Testing & Deployment
- **Phase 6**: Performance Optimization
- **Phase 7**: Advanced Features

---

## 🎯 Success Metrics

✅ Frontend loads without errors  
✅ All pages are responsive  
✅ API endpoints return correct data  
✅ Database queries execute properly  
✅ Student can register & login  
✅ Admin can create content  
✅ Students can submit assignments  
✅ Quiz scoring works correctly  

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**License**: MIT  

**Elite Hub - Learn. Practice. Excel.** 🎓
