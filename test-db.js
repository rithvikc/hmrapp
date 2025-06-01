// Simple test script to verify database setup
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'hmr.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Test database initialization
  console.log('Database connected successfully!');
  
  // Test table creation
  db.exec(`
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dob DATE,
      gender TEXT,
      medicare_number TEXT,
      address TEXT,
      phone TEXT,
      referring_doctor TEXT,
      doctor_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Patient table created successfully!');
  
  // Test insert
  const insertPatient = db.prepare(`
    INSERT INTO patients (name, dob, gender, referring_doctor)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = insertPatient.run('Test Patient', '1980-01-01', 'Male', 'Dr. Test');
  console.log('Test patient inserted with ID:', result.lastInsertRowid);
  
  // Test select
  const getPatients = db.prepare('SELECT * FROM patients');
  const patients = getPatients.all();
  console.log('Patients in database:', patients.length);
  
  // Clean up test data
  db.prepare('DELETE FROM patients WHERE name = ?').run('Test Patient');
  console.log('Test data cleaned up');
  
  db.close();
  console.log('Database test completed successfully!');
  
} catch (error) {
  console.error('Database test failed:', error);
  process.exit(1);
} 