# Elite Hub Student Website - README

## Overview

**Elite Hub** is a comprehensive student learning platform designed to support secondary school students (Forms 1-4) with structured study materials, quizzes, assignments, and direct tutor communication.

## Features

### 📚 Core Features
- **Study Materials**: Access notes, past papers, worked examples, and revision guides
- **Quizzes**: Topic-based quizzes with auto-scoring capabilities
- **Assignments**: Submit assignments with deadline tracking
- **Announcements**: Stay updated with important notices and events
- **Contact Tutor**: Direct communication with academic support

### 👥 User Roles
- **Students**: Access materials, take quizzes, submit assignments
- **Tutor/Admin**: Manage content, create quizzes, grade assignments

### 🎯 Subject Coverage
- Mathematics
- Physics
- Chemistry
- Biology
- English
- Kiswahili
- History
- Geography

### 📱 Responsive Design
- Mobile-friendly interface
- Works on phones, tablets, and desktops
- Clean, intuitive navigation

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Styling with Tailwind CSS
- **JavaScript** - Interactive features
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Mongoose** - ODM for MongoDB

### Tools & Libraries
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **cors** - Cross-origin resource sharing
- **nodemon** - Development tool
- **multer** - File upload handling

## Project Structure

```
elite-hub-website/
├── frontend/
│   ├── index.html              # Home page
│   ├── pages/
│   │   ├── subjects.html       # Subjects page
│   │   ├── resources.html      # Study resources
│   │   ├── quizzes.html        # Quizzes & assignments
│   │   ├── announcements.html  # Announcements
│   │   ├── contact.html        # Contact tutor
│   │   ├── login.html          # Student login
│   │   └── dashboard.html      # Student dashboard
│   └── assets/
│       ├── css/
│       │   └── style.css       # Custom styles
│       └── js/
│           └── main.js         # JavaScript functionality
│
├── backend/
│   ├── server.js               # Main server file
│   ├── package.json            # Dependencies
│   ├── .env.example            # Environment template
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── models/
│   │   ├── Student.js          # Student schema
│   │   ├── Subject.js          # Subject schema
│   │   ├── Quiz.js             # Quiz schema
│   │   ├── Assignment.js       # Assignment schema
│   │   ├── Resource.js         # Resource schema
│   │   └── Announcement.js     # Announcement schema
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── students.js         # Student endpoints
│   │   ├── subjects.js         # Subject endpoints
│   │   ├── quizzes.js          # Quiz endpoints
│   │   ├── assignments.js      # Assignment endpoints
│   │   ├── resources.js        # Resource endpoints
│   │   └── announcements.js    # Announcement endpoints
│   └── middleware/
│       └── (authentication & validation - to be implemented)
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` and set:
   - `MONGODB_URI` - mongodb+srv://ascendlife38_db_user:CsevQagYwpZo3cRs@cluster0.jandejn.mongodb.net/?appName=Cluster0
   - `JWT_SECRET` - Your secret key
   - `PORT` - Server port (default: 5000)

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

The frontend is a static website that can be served directly:

1. **Using a local server:**
   ```bash
   # Python 3
   python -m http.server 3000 --directory frontend

   # Or Node.js http-server
   npx http-server frontend -p 3000
   ```

2. **Or open directly in browser:**
   ```
   file:///path/to/elite-hub-website/frontend/index.html
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Student login

### Student Endpoints
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Subject Endpoints
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (admin)

### Quiz Endpoints
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create quiz (admin)
- `PUT /api/quizzes/:id` - Update quiz (admin)

### Assignment Endpoints
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create assignment (admin)

### Resource Endpoints
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (admin)

### Announcement Endpoints
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get announcement by ID
- `POST /api/announcements` - Create announcement (admin)

## Usage Guide

### For Students
1. **Register/Login**: Create account and login to access dashboard
2. **Browse Subjects**: Explore subjects organized by form
3. **Access Resources**: Download notes, past papers, and study guides
4. **Take Quizzes**: Practice with topic-based quizzes
5. **Submit Assignments**: Upload assignments before deadlines
6. **View Announcements**: Stay updated with latest news
7. **Contact Tutor**: Send messages or schedule appointments

### For Tutor/Admin
1. **Create Content**: Upload study materials and resources
2. **Create Quizzes**: Design topic-based quizzes with auto-scoring
3. **Post Announcements**: Share important updates and notices
4. **Manage Assignments**: Create assignments and grade submissions
5. **View Analytics**: Track student progress and performance

## Features to Implement (Future)

- User authentication with JWT tokens
- Admin dashboard for content management
- Email notifications
- Discussion forums
- Live class integration
- Performance analytics
- Parent access portal
- Payment integration (if applicable)
- Mobile app (React Native/Flutter)
- Video lesson integration
- Real-time notifications

## Database Models

### Student
- name, email, password, form
- enrolledSubjects, quizResults, assignments
- profileImage, createdAt, updatedAt

### Subject
- name, description, icon, forms
- topics, teacher, createdAt

### Quiz
- title, description, subject, form
- questions, totalPoints, timeLimit
- autoScore, published, createdBy, createdAt

### Assignment
- title, description, subject, form
- dueDate, totalPoints, instructions
- submissions, createdBy, createdAt

### Resource
- title, description, type, subject, form
- topic, fileUrl, fileSize, downloadCount
- rating, uploadedBy, createdAt

### Announcement
- title, content, category, targetForms
- targetSubjects, attachments, isStarred
- views, author, createdAt

## Security Considerations

1. **Password Security**: Use bcryptjs for hashing
2. **JWT Tokens**: Use strong secret keys and expiration times
3. **CORS**: Configure allowed origins properly
4. **Input Validation**: Validate all user inputs
5. **SQL Injection**: Use MongoDB which is not susceptible
6. **XSS Protection**: Sanitize user inputs before display
7. **Rate Limiting**: Implement rate limiting (future)
8. **HTTPS**: Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support, contact: seyllaudrey6@gmail.com

## License

MIT License - See LICENSE file for details

## Version

Current Version: 1.0.0
Last Updated: February 2026

---

**Elite Hub - Learn. Practice. Excel.** 🎓
