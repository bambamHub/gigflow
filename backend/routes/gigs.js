const express = require('express');
const { getGigs, createGig } = require('../controllers/gigController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', getGigs);
router.post('/', authMiddleware, createGig);

module.exports = router;
