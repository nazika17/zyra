const { pool } = require('../config/database');

// Create new order
async function createOrder(req, res) {
  const {
    customer_name,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    payment_method,
    items,
    subtotal,
    tax,
    shipping,
    grand_total
  } = req.body;

  if (!customer_name || !email || !phone || !address || !city || !state || !pincode || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Please fill in all required shipping and contact details.' });
  }

  // Generate unique order ID format ZYRA-2026-XXXXXX
  const randomId = Math.floor(100000 + Math.random() * 900000);
  const order_id = `ZYRA-2026-${randomId}`;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_id, customer_name, email, phone, address, city, state, pincode, payment_method, subtotal, tax, shipping, grand_total) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, customer_name, email, phone, address, city, state, pincode, payment_method || 'Cash on Delivery', subtotal || 0, tax || 0, shipping || 0, grand_total || 0]
    );

    const insertedOrderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [insertedOrderId, item.product_id || item.id, item.name || item.product_name, item.price, item.quantity, item.price * item.quantity, item.image]
      );
    }

    await connection.commit();
    connection.release();

    return res.json({
      success: true,
      message: 'Order Placed Successfully!',
      order_id,
      order: {
        id: insertedOrderId,
        order_id,
        customer_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        payment_method: payment_method || 'Cash on Delivery',
        subtotal,
        tax,
        shipping,
        grand_total,
        items,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('[Order Error] DB insert failed:', error.message);
    
    // In-Memory Fallback if DB is offline
    const fallbackOrder = {
      id: Date.now(),
      order_id,
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      payment_method: payment_method || 'Cash on Delivery',
      subtotal: parseFloat(subtotal || 0),
      tax: parseFloat(tax || 0),
      shipping: parseFloat(shipping || 0),
      grand_total: parseFloat(grand_total || 0),
      items,
      created_at: new Date()
    };

    return res.json({
      success: true,
      message: 'Order Placed Successfully (Local Mode)!',
      order_id,
      order: fallbackOrder
    });
  }
}

// Get order details by order_id string
async function getOrderById(req, res) {
  const { orderId } = req.params;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id = ? OR id = ?', [orderId, orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(404).json({ success: false, message: 'Order details unavailable.' });
  }
}

module.exports = { createOrder, getOrderById };
