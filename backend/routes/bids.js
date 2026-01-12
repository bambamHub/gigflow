const express = require('express');
const { createBid, getBidsByGig, hireBid } = require('../controllers/bidController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createBid);
router.get('/:gigId', authMiddleware, getBidsByGig);
router.patch('/:bidId/hire', authMiddleware, hireBid);

module.exports = router;
