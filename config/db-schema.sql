-- Database Schema for Plagiarism Checker Application

USE plagiarism_checker_db;

-- Users table (for all user types: admin, teacher, student)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(100) NOT NULL,
  class_code VARCHAR(20) UNIQUE NOT NULL,
  teacher_id INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Class Students (many-to-many relationship)
CREATE TABLE IF NOT EXISTS class_students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_class_student (class_id, student_id)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  due_date DATETIME,
  max_score INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  extracted_text TEXT,
  similarity_score DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('pending', 'checked', 'rejected', 'approved') DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_at TIMESTAMP NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment_student (assignment_id, student_id)
);

-- Plagiarism matches table (stores similarity comparisons)
CREATE TABLE IF NOT EXISTS plagiarism_matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  matched_submission_id INT,
  matched_source_type ENUM('submission', 'external') NOT NULL,
  similarity_percentage DECIMAL(5,2) NOT NULL,
  matched_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_submission_id) REFERENCES submissions(id) ON DELETE SET NULL
);

-- External sources table (for storing external documents for comparison)
CREATE TABLE IF NOT EXISTS external_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  extracted_text TEXT,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_plagiarism_submission ON plagiarism_matches(submission_id);
CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);




