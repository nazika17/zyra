const express = require('express');
const router = express.Router();
const { getProductReviews, addReview } = require('../controllers/reviewController');

router.get('/:productId', getProductReviews);
router.post('/', addReview);

module.exports = router;
