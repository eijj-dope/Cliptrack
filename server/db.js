// MySQL connection pool. Import this anywhere you need the database:
//   const db = require('../db');  then  const [rows] = await db.query('SELECT ...', [params]);
require('dotenv').config();
const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cliptrack',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true   // DATE and TIME columns come back as plain text like "2026-10-09" and "14:30:00"
});
