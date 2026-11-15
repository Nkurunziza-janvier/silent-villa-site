import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import crypto from 'node:crypto'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const app = express()
const PORT = process.env.PORT || 3001
const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('Set JWT_SECRET to a random value at least 32 characters long.')
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
  connectionLimit: 10,
  dateStrings: true,
  timezone: 'Z',
})

const uploadDir = path.resolve(dirname, '../uploads')
fs.mkdirSync(uploadDir, { recursive: true })
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }))
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }))

const imageStorage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype] || path.extname(file.originalname).toLowerCase()
    callback(null, `${crypto.randomUUID()}${extension}`)
  },
})
const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new Error('Choose a JPG, PNG, or WebP image.'))
      return
    }
    callback(null, true)
  },
})

function requireAdmin(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' })
  try {
    req.admin = jwt.verify(token, jwtSecret)
    return next()
  } catch {
    return res.status(401).json({ error: 'Your admin session has expired. Please sign in again.' })
  }
}

const emailIsValid = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const dateIsValid = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'database unavailable' })
  }
})

app.get('/api/rooms', async (_req, res, next) => {
  try {
    const [rooms] = await pool.query('SELECT id, name, price, image_url AS imageUrl, description FROM rooms WHERE is_active = TRUE ORDER BY created_at DESC')
    res.json(rooms)
  } catch (error) { next(error) }
})

app.get('/api/gallery', async (_req, res, next) => {
  try {
    const [images] = await pool.query('SELECT id, title, alt_text AS altText, image_url AS imageUrl, created_at AS createdAt FROM gallery_images ORDER BY created_at DESC')
    res.json(images)
  } catch (error) { next(error) }
})

app.post('/api/bookings', async (req, res, next) => {
  const { roomId, name, email, phone, checkIn, checkOut, guests = 1, specialRequests = '' } = req.body || {}
  if (!Number.isInteger(Number(roomId)) || typeof name !== 'string' || !name.trim() || name.trim().length > 120 || !emailIsValid(email) || email.length > 190 || typeof phone !== 'string' || !phone.trim() || phone.trim().length > 40 || !dateIsValid(checkIn) || !dateIsValid(checkOut) || !Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > 20 || typeof specialRequests !== 'string' || specialRequests.length > 2000) {
    return res.status(400).json({ error: 'Please check the required details and try again.' })
  }
  if (checkOut <= checkIn || checkIn < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ error: 'Choose a future check-in date and a check-out date after it.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rooms] = await connection.query('SELECT id FROM rooms WHERE id = ? AND is_active = TRUE FOR UPDATE', [Number(roomId)])
    if (!rooms.length) {
      await connection.rollback()
      return res.status(404).json({ error: 'That room is no longer available.' })
    }
    const [overlaps] = await connection.query(
      "SELECT id FROM bookings WHERE room_id = ? AND status IN ('pending', 'confirmed') AND check_in < ? AND check_out > ? LIMIT 1",
      [Number(roomId), checkOut, checkIn],
    )
    if (overlaps.length) {
      await connection.rollback()
      return res.status(409).json({ error: 'Those dates have just been booked. Please choose other dates.' })
    }
    const [result] = await connection.query(
      'INSERT INTO bookings (room_id, guest_name, email, phone, check_in, check_out, guests, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Number(roomId), name.trim(), email.trim().toLowerCase(), phone.trim(), checkIn, checkOut, Number(guests), String(specialRequests).trim() || null],
    )
    await connection.commit()
    res.status(201).json({ id: result.insertId, message: 'Your booking request was sent. Silent Villa will be in touch shortly.' })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally { connection.release() }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const [admins] = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1', [email])
    if (!admins.length || !(await bcrypt.compare(password, admins[0].password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' })
    }
    const token = jwt.sign({ id: admins[0].id, email: admins[0].email }, jwtSecret, { expiresIn: '12h' })
    res.json({ token, email: admins[0].email })
  } catch (error) { next(error) }
})

app.get('/api/admin/bookings', requireAdmin, async (req, res, next) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.id, b.room_id AS roomId, r.name AS roomName, r.image_url AS roomImage, r.price AS roomPrice,
       b.guest_name AS name, b.email, b.phone, b.check_in AS checkIn, b.check_out AS checkOut,
       b.guests, b.special_requests AS specialRequests, b.status, b.notification_read AS notificationRead, b.created_at AS createdAt
       FROM bookings b JOIN rooms r ON r.id = b.room_id ORDER BY b.created_at DESC LIMIT 200`,
    )
    res.json(bookings)
  } catch (error) { next(error) }
})

app.patch('/api/admin/bookings/:id/status', requireAdmin, async (req, res, next) => {
  const { status } = req.body || {}
  const bookingId = Number(req.params.id)
  if (!Number.isSafeInteger(bookingId) || bookingId < 1 || !['pending', 'confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Choose a valid booking and status.' })
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.query('SELECT id, room_id AS roomId, check_in AS checkIn, check_out AS checkOut FROM bookings WHERE id = ? FOR UPDATE', [bookingId])
    if (!rows.length) {
      await connection.rollback()
      return res.status(404).json({ error: 'Booking not found.' })
    }
    const booking = rows[0]
    if (status !== 'cancelled') {
      await connection.query('SELECT id FROM rooms WHERE id = ? FOR UPDATE', [booking.roomId])
      const [overlaps] = await connection.query(
        "SELECT id FROM bookings WHERE room_id = ? AND id <> ? AND status IN ('pending', 'confirmed') AND check_in < ? AND check_out > ? LIMIT 1",
        [booking.roomId, bookingId, booking.checkOut, booking.checkIn],
      )
      if (overlaps.length) {
        await connection.rollback()
        return res.status(409).json({ error: 'This booking overlaps another active reservation and cannot be reopened.' })
      }
    }
    await connection.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId])
    await connection.commit()
    res.json({ message: 'Booking status updated.' })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally { connection.release() }
})

app.patch('/api/admin/bookings/read', requireAdmin, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : []
    if (ids.length) await pool.query('UPDATE bookings SET notification_read = TRUE WHERE id IN (?)', [ids])
    res.json({ message: 'Notifications marked as read.' })
  } catch (error) { next(error) }
})

app.get('/api/admin/rooms', requireAdmin, async (_req, res, next) => {
  try {
    const [rooms] = await pool.query('SELECT id, name, price, image_url AS imageUrl, description, is_active AS isActive, created_at AS createdAt FROM rooms ORDER BY created_at DESC')
    res.json(rooms)
  } catch (error) { next(error) }
})

app.post('/api/admin/rooms', requireAdmin, imageUpload.single('image'), async (req, res, next) => {
  const { name, price, description = '' } = req.body || {}
  if (!name?.trim() || name.trim().length > 120 || !Number.isFinite(Number(price)) || Number(price) <= 0 || String(description).length > 2000 || !req.file) {
    if (req.file) fs.unlink(req.file.path, () => {})
    return res.status(400).json({ error: 'Room name, positive price, and room image are required.' })
  }
  try {
    const imageUrl = `/uploads/${req.file.filename}`
    const [result] = await pool.query('INSERT INTO rooms (name, price, image_url, description) VALUES (?, ?, ?, ?)', [name.trim(), Number(price), imageUrl, String(description).trim() || null])
    res.status(201).json({ id: result.insertId, name: name.trim(), price: Number(price), imageUrl, description })
  } catch (error) {
    fs.unlink(req.file.path, () => {})
    next(error)
  }
})

app.get('/api/admin/gallery', requireAdmin, async (_req, res, next) => {
  try {
    const [images] = await pool.query('SELECT id, title, alt_text AS altText, image_url AS imageUrl, created_at AS createdAt FROM gallery_images ORDER BY created_at DESC')
    res.json(images)
  } catch (error) { next(error) }
})

app.post('/api/admin/gallery', requireAdmin, imageUpload.single('image'), async (req, res, next) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  const altText = typeof req.body?.altText === 'string' ? req.body.altText.trim() : ''
  if (!title || title.length > 160 || altText.length > 250 || !req.file) {
    if (req.file) fs.unlink(req.file.path, () => {})
    return res.status(400).json({ error: 'A title and gallery image are required. Alt text must be under 250 characters.' })
  }
  try {
    const imageUrl = `/uploads/${req.file.filename}`
    const [result] = await pool.query('INSERT INTO gallery_images (title, alt_text, image_url) VALUES (?, ?, ?)', [title, altText || null, imageUrl])
    res.status(201).json({ id: result.insertId, title, altText: altText || null, imageUrl })
  } catch (error) {
    fs.unlink(req.file.path, () => {})
    next(error)
  }
})

app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Choose a valid gallery image.' })
  try {
    const [images] = await pool.query('SELECT image_url AS imageUrl FROM gallery_images WHERE id = ?', [id])
    if (!images.length) return res.status(404).json({ error: 'Gallery image not found.' })
    await pool.query('DELETE FROM gallery_images WHERE id = ?', [id])
    const filename = path.basename(images[0].imageUrl)
    fs.unlink(path.join(uploadDir, filename), (error) => {
      if (error && error.code !== 'ENOENT') console.error('Could not remove gallery image file:', error.message)
    })
    res.json({ message: 'Gallery image removed.' })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error instanceof multer.MulterError) return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'Could not upload image.' })
  if (error.message === 'Choose a JPG, PNG, or WebP image.') return res.status(400).json({ error: error.message })
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
})

async function start() {
  await pool.query('SELECT 1')
  await pool.query(`CREATE TABLE IF NOT EXISTS gallery_images (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    alt_text VARCHAR(250) NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gallery_created (created_at)
  )`)
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.')
  const [admins] = await pool.query('SELECT id FROM admins WHERE email = ?', [email])
  if (!admins.length) {
    const hash = await bcrypt.hash(password, 12)
    await pool.query('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [email, hash])
    console.log(`Created initial admin account: ${email}`)
  }
  app.listen(PORT, () => console.log(`Silent Villa API listening on port ${PORT}`))
}

start().catch((error) => {
  console.error('Could not start API:', error.message)
  process.exit(1)
})
