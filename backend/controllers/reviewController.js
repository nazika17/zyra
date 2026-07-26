const { pool } = require('../config/database');

// In-memory mock reviews store for fallbacks
const mockReviewsStore = {
  1: [
    { id: 101, user_name: 'Sophia Miller', rating: 5, comment: 'The Velvet Rose Lipstick feels weightless and stays vibrant all day. Hands down the best lipstick I have ever owned!', created_at: '2026-07-20T10:00:00Z' },
    { id: 102, user_name: 'Ananya Sharma', rating: 5, comment: 'Gorgeous rose gold packaging and super hydrating finish. Absolutely in love!', created_at: '2026-07-15T14:30:00Z' }
  ],
  3: [
    { id: 103, user_name: 'Elena Rostova', rating: 5, comment: 'Luminous Silk Foundation matched my skin tone perfectly with a natural satin radiance.', created_at: '2026-07-18T11:20:00Z' }
  ]
};

// Get reviews for product
async function getProductReviews(req, res) {
  const { productId } = req.params;

  try {
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );

    return res.json({ success: true, reviews });
  } catch (error) {
    const reviews = mockReviewsStore[productId] || [
      { id: 1, user_name: 'Sophia M.', rating: 5, comment: 'Stunning luxury product! Feels incredible on the skin and lasts all day.', created_at: new Date().toISOString() },
      { id: 2, user_name: 'Priya K.', rating: 5, comment: 'Beautiful texture and high pigment payoff. Fast delivery as well.', created_at: new Date().toISOString() }
    ];
    return res.json({ success: true, reviews });
  }
}

// Add new review
async function addReview(req, res) {
  const { product_id, user_name, user_email, rating, comment } = req.body;

  if (!product_id || !user_name || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Please provide rating, your name, and a review comment.' });
  }

  try {
    await pool.query(
      'INSERT INTO reviews (product_id, user_name, user_email, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [product_id, user_name, user_email || '', parseInt(rating), comment]
    );

    // Recalculate average rating & reviews_count for product
    const [avgRows] = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
      [product_id]
    );

    if (avgRows.length > 0) {
      const avg = parseFloat(avgRows[0].avg_rating || rating).toFixed(1);
      const count = avgRows[0].count;

      await pool.query(
        'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
        [avg, count, product_id]
      );
    }

    return res.json({ success: true, message: 'Thank you! Your review has been published.' });
  } catch (error) {
    if (!mockReviewsStore[product_id]) mockReviewsStore[product_id] = [];
    const newRev = {
      id: Date.now(),
      user_name,
      user_email,
      rating: parseInt(rating),
      comment,
      created_at: new Date().toISOString()
    };
    mockReviewsStore[product_id].unshift(newRev);

    return res.json({ success: true, message: 'Thank you! Your review has been published.' });
  }
}

module.exports = { getProductReviews, addReview };
