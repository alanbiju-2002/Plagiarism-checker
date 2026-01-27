<<<<<<< HEAD
# Plagiarism-checker
Web application to compare the similarity between assignments of students.
=======
# Plagiarism Checker - Assignment Management System

A comprehensive web application for managing assignments, checking plagiarism, and tracking student submissions. Similar to Google Classroom with built-in plagiarism detection.

## Features

### Student Module
- Join classes using class codes
- View assignments for enrolled classes
- Upload assignment submissions (PDF, DOCX, DOC, TXT)
- View plagiarism scores and submission status
- Receive rejection messages if similarity > 50%

### Teacher Module
- Create and manage classes
- Add students to classes
- Create assignments with due dates
- View all student submissions
- Monitor plagiarism scores
- View detailed plagiarism matches

### Admin Module
- Approve/reject teacher and student registrations
- View all users and their status
- Access comprehensive score reports
- View system statistics
- Manage external sources for plagiarism checking

## Technology Stack

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- File upload handling (Multer)
- Text extraction from PDF/DOCX files
- Plagiarism detection algorithm

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=plagiarism_checker_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

3. Set up the database:
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
mysql -u root -p plagiarism_checker_db < config/db-schema.sql
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the React app:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Database Schema

The application uses the following main tables:
- `users` - Stores all users (admin, teacher, student)
- `classes` - Stores class information
- `class_students` - Many-to-many relationship between classes and students
- `assignments` - Stores assignment details
- `submissions` - Stores student submissions
- `plagiarism_matches` - Stores plagiarism detection results
- `external_sources` - Stores external documents for comparison

## Usage

### Initial Setup

1. **Create an Admin Account:**
   - Register with role "admin"
   - Admin accounts are automatically approved

2. **Approve Users:**
   - Login as admin
   - Go to "Pending Users"
   - Approve teachers and students

3. **Create Classes (Teacher):**
   - Login as teacher
   - Create a class with a unique class code
   - Add students to the class

4. **Create Assignments (Teacher):**
   - Select a class
   - Create assignment with title, description, and due date

5. **Submit Assignments (Student):**
   - Join a class using the class code
   - View assignments
   - Upload submission file
   - Wait for plagiarism check (automatic)

### Plagiarism Detection

The system automatically:
- Extracts text from uploaded files
- Compares with other submissions in the same assignment
- Compares with external sources (if uploaded)
- Calculates similarity percentage
- Rejects if similarity > 50%
- Stores detailed match information

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Student
- `GET /api/student/classes` - Get student's classes
- `POST /api/student/classes/join` - Join class by code
- `GET /api/student/classes/:id/assignments` - Get assignments
- `GET /api/student/submissions` - Get student's submissions
- `GET /api/student/submissions/:id` - Get submission details

### Teacher
- `POST /api/teacher/classes` - Create class
- `GET /api/teacher/classes` - Get teacher's classes
- `POST /api/teacher/classes/:id/students` - Add student to class
- `GET /api/teacher/classes/:id/students` - Get class students
- `POST /api/teacher/assignments` - Create assignment
- `GET /api/teacher/assignments/:id/submissions` - Get submissions

### Admin
- `GET /api/admin/pending-users` - Get pending users
- `POST /api/admin/approve-user/:id` - Approve user
- `POST /api/admin/reject-user/:id` - Reject user
- `GET /api/admin/users` - Get all users
- `GET /api/admin/scores` - Get all scores
- `GET /api/admin/statistics` - Get statistics

### Assignments
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id` - Get assignment details
- `DELETE /api/assignments/submissions/:id` - Delete submission

### Plagiarism
- `POST /api/plagiarism/external-sources` - Upload external source
- `GET /api/plagiarism/external-sources` - Get external sources
- `POST /api/plagiarism/recheck/:id` - Re-check submission

## File Upload

Supported formats:
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Text files (.txt)

Maximum file size: 10MB (configurable)

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- File type validation
- SQL injection protection (parameterized queries)

## Development

### Running in Development Mode

Backend with auto-reload:
```bash
npm run dev
```

Frontend:
```bash
cd client
npm start
```

Both simultaneously:
```bash
npm run dev-all
```

## Troubleshooting

1. **Database Connection Error:**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **File Upload Fails:**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure file type is supported

3. **Plagiarism Check Not Working:**
   - Check file extraction is successful
   - Verify text was extracted from file
   - Check server logs for errors

## License

This project is for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.




>>>>>>> 8a5a678 (first commit)
