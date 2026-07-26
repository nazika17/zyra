const { pool } = require('../config/database');

async function submitContactMessage(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone || '', subject || 'General Inquiry', message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to ZYRA! Your message has been received and our beauty concierges will respond shortly.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit message.' });
  }
}

module.exports = { submitContactMessage };
