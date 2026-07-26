const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Register user
async function register(req, res) {
  try {
    const { fullname, email, phone, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    // Check if email exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into MySQL
    const [result] = await pool.execute(
      'INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)',
      [fullname.trim(), email.toLowerCase().trim(), phone || '', hashedPassword]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), fullname: fullname.trim() },
      process.env.JWT_SECRET || 'zyra_luxury_cosmetics_secret_key_2026',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to ZYRA.',
      token,
      user: { id: userId, fullname: fullname.trim(), email: email.toLowerCase().trim(), phone: phone || '' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// Login user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Fetch user from MySQL
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullname: user.fullname },
      process.env.JWT_SECRET || 'zyra_luxury_cosmetics_secret_key_2026',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// Get current user profile
async function me(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    const [rows] = await pool.execute('SELECT id, fullname, email, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login, me };
