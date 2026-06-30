const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database URL from environment or fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:nhatle090103@localhost:5432/japanese_dictionary';

const pool = new Pool({
  connectionString,
});

async function initDb() {
  console.log('Starting Database Initialization...');
  const client = await pool.connect();
  try {
    // 1. Read SQL file
    const sqlPath = path.join(__dirname, 'init_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing database schema creation and seed data...');
    await client.query(sql);

    // 2. Insert admin and student users with bcrypt password hashing
    console.log('Inserting default users (admin and student)...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    await client.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (username) DO NOTHING`,
      ['admin', 'admin@nihongogo.com', adminPasswordHash, 'admin']
    );

    await client.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (username) DO NOTHING`,
      ['student', 'student@nihongogo.com', studentPasswordHash, 'student']
    );

    console.log('Database Initialization Completed Successfully!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();
