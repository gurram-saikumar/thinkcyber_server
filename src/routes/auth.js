const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const pool = new Pool();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = '15m';
const APP_URL = process.env.APP_URL || 'https://yourapp.com';

// Google SMTP config from .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstname
 *               - lastname
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'user@example.com'
 *               firstname:
 *                 type: string
 *                 example: 'Sai'
 *               lastname:
 *                 type: string
 *                 example: 'Kumar'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid input or user exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { email, firstname, lastname } = req.body;
  if (!email || !firstname || !lastname) {
    return res.status(400).json({ success: false, error: 'Email, firstname, and lastname required' });
  }
  const name = `${firstname} ${lastname}`;
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    const result = await pool.query(
      'INSERT INTO users (email, name, is_verified) VALUES ($1, $2, $3) RETURNING *',
      [email, name, false]
    );
    // Generate OTP for signup
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await pool.query(
      'INSERT INTO otp_verifications (user_id, otp, expires_at) VALUES ($1, $2, $3)',
      [result.rows[0].id, otp, expiresAt]
    );
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your ThinkCyber Signup OTP',
      html: `<p>Your signup OTP is: <b>${otp}</b><br>This code is valid for 10 minutes.</p>`
    });
    res.status(201).json({ success: true, user: result.rows[0], message: 'Signup successful, OTP sent to email.' });
  } catch (err) {
    console.error('Signup DB error:', err); // This will print the real error to your server logs
    res.status(500).json({ success: false, error: 'DB error' });
  }
});
/**
 * @swagger
 * /api/auth/verify-signup-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify signup OTP and activate user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'user@example.com'
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: User verified and activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 sessionToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

// POST /auth/verify-signup-otp
router.post('/verify-signup-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP required' });
  }
  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!userRes.rows.length) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    const userId = userRes.rows[0].id;
    const otpRes = await pool.query(
      'SELECT * FROM otp_verifications WHERE user_id = $1 AND otp = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, otp]
    );
    if (!otpRes.rows.length || new Date() > new Date(otpRes.rows[0].expires_at)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    // Mark user as verified
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    // Issue session JWT
    const sessionToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    // Delete OTP after use
    await pool.query('DELETE FROM otp_verifications WHERE id = $1', [otpRes.rows[0].id]);
    res.json({ success: true, user, sessionToken });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB error' });
  }
});
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out user (JWT client-side only)
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

// POST /auth/logout
router.post('/logout', (req, res) => {
  // For JWT, logout is client-side (delete token).
  // For server-side sessions, destroy session here.
  res.json({ success: true, message: 'Logged out. Please delete your token on client.' });
});
// ...existing code...

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Passwordless Magic Link Authentication
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to user's email for login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'user@example.com'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Server or email error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and log in user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'user@example.com'
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: User verified and session token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 sessionToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

// POST /auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }
  let user;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length) {
      user = result.rows[0];
    } else {
      const insert = await pool.query(
        'INSERT INTO users (email, is_verified, name, address) VALUES ($1, false, $2, $3) RETURNING *',
        [email, 'OTPUser', 'Unknown']
      );
      user = insert.rows[0];
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'DB error' });
  }
  // Generate OTP (6 digits)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Store OTP in otp_verifications table
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
  try {
    await pool.query(
      'INSERT INTO otp_verifications (user_id, otp, expires_at) VALUES ($1, $2, $3)',
      [user.id, otp, expiresAt]
    );
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your ThinkCyber Login OTP',
      html: `<p>Your OTP is: <b>${otp}</b><br>This code is valid for 10 minutes.</p>`
    });
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Email send failed' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP required' });
  }
  // Find OTP for user in DB
  let userId;
  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!userRes.rows.length) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    userId = userRes.rows[0].id;
    const otpRes = await pool.query(
      'SELECT * FROM otp_verifications WHERE user_id = $1 AND otp = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, otp]
    );
    if (!otpRes.rows.length || new Date() > new Date(otpRes.rows[0].expires_at)) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    // Mark user as verified
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [userId]);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    // Issue session JWT (longer expiry)
    const sessionToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    // Delete OTP after use
    await pool.query('DELETE FROM otp_verifications WHERE id = $1', [otpRes.rows[0].id]);
    res.json({ success: true, user, sessionToken });
  } catch (err) {
    res.status(500).json({ success: false, error: 'DB error' });
  }
});
/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Verify magic link token and log in
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token from magic link
 *     responses:
 *       200:
 *         description: User verified and session token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 sessionToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */

module.exports = router;

// DEBUG: Inspect users table
router.get('/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 5');
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
