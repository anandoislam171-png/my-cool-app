import multer from 'multer';
import path from 'path';

// ফাইল কোথায় সেভ হবে তা ঠিক করা
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // আপনার প্রোজেক্টে 'uploads' নামে একটি ফোল্ডার খুলে রাখুন
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // ১০০ এমবি পর্যন্ত ফাইল অ্যালাউ করবে
});