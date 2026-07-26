const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateQuantity, removeFromCart, clearCart } = require('../controllers/cartController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.use(optionalAuthMiddleware);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateQuantity);
router.delete('/clear', clearCart);
router.delete('/:id', removeFromCart);

module.exports = router;
