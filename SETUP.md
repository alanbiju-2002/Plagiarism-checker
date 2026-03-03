# Setup Guide

## Quick Start

### 1. Database Setup

1. Make sure MySQL is running on your system
2. Create the database (if not already created):
```sql
CREATE DATABASE plagiarism_checker_db;
```

3. Run the schema file:
```bash
# On Windows (PowerShell)
mysql -u root -p plagiarism_checker_db < config/db-schema.sql

# On Linux/Mac
mysql -u root -p plagiarism_checker_db < config/db-schema.sql
```

Or manually copy and paste the SQL from `config/db-schema.sql` into your MySQL client.

### 2. Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=plagiarism_checker_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

3. Create uploads directory:
```bash
mkdir uploads
mkdir uploads/assignments
mkdir uploads/external
```

4. Start the backend server:
```bash
npm start
# or for development
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### 4. Initial User Setup

1. **Register an Admin Account:**
   - Go to `http://localhost:3000/register`
   - Fill in the form
   - Select "Admin" as role
   - Admin accounts are automatically approved

2. **Login as Admin:**
   - Go to `http://localhost:3000/login`
   - Login with your admin credentials

3. **Approve Users:**
   - Navigate to "Pending Users" in the admin dashboard
   - Approve teachers and students who have registered

## Testing the Application

### As a Teacher:

1. Register a teacher account (or use an approved one)
2. Login and create a class
3. Note the class code
4. Create an assignment for the class
5. Add students to the class (you'll need their user IDs)

### As a Student:

1. Register a student account (or use an approved one)
2. Login and join a class using the class code
3. View assignments for your classes
4. Submit an assignment (upload a file)
5. View your submission status and similarity score

### Testing Plagiarism Detection:

1. Have two students submit similar assignments
2. The system will automatically detect similarity
3. If similarity > 50%, the submission will be rejected
4. View detailed matches in the submission details

## Common Issues

### Database Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check database credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

### File Upload Fails
- Check `uploads` directory exists and has write permissions
- Verify file size is under the limit (10MB default)
- Ensure file type is supported (PDF, DOCX, DOC, TXT)

### CORS Errors
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in client `.env`
- Verify CORS is enabled in `server.js`

## Production Deployment

1. Build the React app:
```bash
cd client
npm run build
```

2. Set `NODE_ENV=production` in backend `.env`

3. The backend will serve the React build files automatically

4. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js
```

## Notes

- The plagiarism detection uses string similarity algorithms
- For production, consider using more advanced plagiarism detection services
- File uploads are stored in the `uploads` directory
- Make sure to backup your database regularly





