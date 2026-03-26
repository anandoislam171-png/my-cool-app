const express = require('express');
const router = express.Router();
const { createPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// OAuth2 দিয়ে সুরক্ষিত রাউট
router.post('/create', protect, createPost);

module.exports = router;