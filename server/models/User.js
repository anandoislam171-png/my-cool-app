import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6
  },
  // OnyxDrift এর ৪টি স্পেশাল মোড
  activeMode: {
    type: String,
    enum: ['minimal', 'video', 'chat', 'knowledge'],
    default: 'minimal'
  },
  avatar: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: "Accessing the OnyxDrift network..."
  }
}, {
  timestamps: true // createdAt এবং updatedAt অটোমেটিক ম্যানেজ হবে
});

// --- পাসওয়ার্ড সেভ করার আগে অটোমেটিক এনক্রিপশন ---
userSchema.pre('save', async function(next) {
  // যদি পাসওয়ার্ড মডিফাই না হয়, তবে পরবর্তী স্টেপে চলে যাও
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- লগইন করার সময় পাসওয়ার্ড চেক করার মেথড ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  // enteredPassword হলো ইউজারের দেওয়া টেক্সট, আর this.password হলো ডাটাবেজের হ্যাশ
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;