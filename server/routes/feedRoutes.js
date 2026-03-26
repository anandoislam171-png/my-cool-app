const express = require('express');
const router = express.Router();
const { getNeuralFeed } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware'); // আপনার OAuth2 মিডলওয়্যার

// শুধুমাত্র লগইন করা ইউজাররাই ফিড পাবে
router.get('/neural', protect, getNeuralFeed);

module.exports = router;