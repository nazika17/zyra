const { pool } = require('../config/database');

// Get cart items for user
async function getCart(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;

    const [items] = await pool.execute(
      `SELECT c.id as cart_id, c.product_id, c.quantity, c.created_at,
              p.name, p.category, p.price, p.image, p.shade, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.id DESC`,
      [userId]
    );

    let subtotal = 0;
    items.forEach(item => {
      item.item_total = parseFloat(item.price) * item.quantity;
      subtotal += item.item_total;
    });

    const tax = subtotal * 0.05; // 5% luxury tax
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 15.00;
    const total = subtotal + tax + shipping;

    return res.json({
      success: true,
      count: items.length,
      cart: items,
      summary: {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
}

// Add item to cart
async function addToCart(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const qty = parseInt(quantity, 10) || 1;

    // Check if item exists in cart
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + qty;
      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQty, existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, qty]
      );
    }

    return res.status(201).json({ success: true, message: 'Added to your Shopping Cart 🛒' });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
}

// Update quantity
async function updateQuantity(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params; // cart item id or product_id
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      await pool.execute(
        'DELETE FROM cart WHERE user_id = ? AND (id = ? OR product_id = ?)',
        [userId, id, id]
      );
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    await pool.execute(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND (id = ? OR product_id = ?)',
      [qty, userId, id, id]
    );

    return res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    console.error('Update quantity error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update quantity.' });
  }
}

// Remove item from cart
async function removeFromCart(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { id } = req.params;

    await pool.execute(
      'DELETE FROM cart WHERE user_id = ? AND (id = ? OR product_id = ?)',
      [userId, id, id]
    );

    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
}

// Clear cart (Checkout submission)
async function clearCart(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'Order placed successfully! Thank you for shopping with ZYRA.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete order.' });
  }
}

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
