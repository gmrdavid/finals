# 🎓 Student Information Management System
**IT318 Web Development Final Practical Examination**

## 🚀 Live Deployment
[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-brightgreen)](YOUR_RENDER_URL_HERE)

## 📋 Features
✅ **Complete CRUD Operations** (Create, Read, Update, Delete)  
✅ **Cloud Database** (Aiven MySQL)  
✅ **Responsive Frontend** (HTML/CSS/JS)  
✅ **Node.js Backend** with Express  
✅ **Professional UI/UX** Design  

## 🛠️ Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Aiven Cloud)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Hosting**: Render
- **Version Control**: GitHub

## 📱 Demo Features
1. **Add Student** - Complete registration form
2. **View Students** - Responsive data table
3. **Edit Student** - Update any student record
4. **Delete Student** - Remove records with confirmation

## 🗄️ Database Schema
```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  course VARCHAR(50) NOT NULL,
  year_level INT NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);