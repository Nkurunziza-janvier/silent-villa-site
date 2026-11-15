import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import fs from 'node:fs'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

if (!email || !password || password.length < 12) {
  throw new Error('Set ADMIN_EMAIL and a new ADMIN_PASSWORD with at least 12 characters in a private environment.')
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'silent_villa',
  ssl: process.env.DB_SSL === 'true'
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ...(process.env.DB_SSL_CA ? { ca: fs.readFileSync(process.env.DB_SSL_CA) } : {}),
      }
    : undefined,
  waitForConnections: true,
  connectionLimit: 1,
  dateStrings: true,
  timezone: 'Z',
})

try {
  const hash = await bcrypt.hash(password, 12)
  const [result] = await pool.query('UPDATE admins SET password_hash = ? WHERE email = ?', [hash, email])
  if (!result.affectedRows) throw new Error('No administrator account matched ADMIN_EMAIL.')
  console.log('Admin password updated. The password was not displayed.')
} catch (error) {
  console.error('Admin password reset failed:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
