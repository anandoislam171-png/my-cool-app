import express from 'express';
const router = express.Router();
import multer from 'multer';
import { 
  createPost, 
  likePost, 
  getReels, 
  addComment, 
  updateReelPulse 
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

// মুল্টার কনফিগারেশন (সাময়িকভাবে ছবি স্টোর করার জন্য)
const upload = multer({ dest: 'uploads/' });

// --- Neural Routes ---

// পোস্ট তৈরি (ছবি বা ভিডিওসহ)
router.post('/create', protect, upload.single('media'), createPost);

// লাইক/এনার্জি টগল
router.post('/:id/like', protect, likePost);

// রিলস এবং ফিড
router.get('/reels', protect, getReels);
router.patch('/:id/pulse', protect, updateReelPulse);

// কমেন্ট সেকশন
router.post('/:id/comment', protect, addComment);

export default router;