const { pool } = require('../config/database');

// Get wishlist items for user
async function getWishlist(req, res) {
  try {
    const userId = req.user ? req.user.id : 1; // Fallback or guest user ID 1
    const [items] = await pool.execute(
      `SELECT w.id as wishlist_id, w.product_id, w.created_at,
              p.name, p.category, p.price, p.image, p.shade, p.stock, p.rating
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`,
      [userId]
    );

    return res.json({ success: true, count: items.length, wishlist: items });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
}

// Add product to wishlist
async function addToWishlist(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // Check if already in wishlist
    const [existing] = await pool.execute(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      return res.json({ success: true, message: 'Item is already in your wishlist.' });
    }

    await pool.execute(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );

    return res.status(201).json({ success: true, message: 'Added to your Wishlist ❤️' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to wishlist.' });
  }
}

// Remove from wishlist
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params; // wishlist id or product_id

    await pool.execute(
      'DELETE FROM wishlist WHERE user_id = ? AND (id = ? OR product_id = ?)',
      [userId, id, id]
    );

    return res.json({ success: true, message: 'Item removed from wishlist.' });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
}

// Move wishlist item to cart
async function moveToCart(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // 1. Add to cart
    const [cartExist] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (cartExist.length > 0) {
      await pool.execute(
        'UPDATE cart SET quantity = quantity + 1 WHERE id = ?',
        [cartExist[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)',
        [userId, product_id]
      );
    }

    // 2. Remove from wishlist
    await pool.execute(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    return res.json({ success: true, message: 'Moved item to your Shopping Cart 🛒' });
  } catch (error) {
    console.error('Move to cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to move item to cart.' });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
