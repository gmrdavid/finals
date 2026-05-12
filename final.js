const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database Configuration (Using Environment Variables)
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Test Database Connection
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Create Database Pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Database and Table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if not exists
    await connection.execute('CREATE DATABASE IF NOT EXISTS crud');
    await connection.execute('USE student_db');
    
    // Create students table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        course VARCHAR(50) NOT NULL,
        year_level INT NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.execute(createTableQuery);
    console.log('✅ Database and table initialized successfully!');
    
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// CRUD Routes

// READ - Get all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM students ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// CREATE - Add new student
app.post('/api/students', async (req, res) => {
  try {
    const { student_id, full_name, course, year_level, email } = req.body;
    
    const query = `
      INSERT INTO students (student_id, full_name, course, year_level, email)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      student_id, full_name, course, year_level, email
    ]);
    
    res.json({ 
      success: true, 
      id: result.insertId,
      message: 'Student added successfully!'
    });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Student ID or Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add student' });
    }
  }
});

// READ - Get single student for editing
app.get('/api/students/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// UPDATE - Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { student_id, full_name, course, year_level, email } = req.body;
    
    const query = `
      UPDATE students 
      SET student_id = ?, full_name = ?, course = ?, year_level = ?, email = ?
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [
      student_id, full_name, course, year_level, email, req.params.id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student updated successfully!' });
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Student ID or Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update student' });
    }
  }
});

// DELETE - Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM students WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student deleted successfully!' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Serve Frontend Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add.html'));
});

app.get('/edit/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'edit.html'));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start Server
async function startServer() {
  await testConnection();
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/students`);
  });
}

startServer().catch(console.error);