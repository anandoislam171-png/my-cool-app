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
  }
}, {
  // এটি অটোমেটিক createdAt এবং updatedAt (ID এর সাথে সময়) যোগ করবে
  timestamps: true 
});

// --- পাসওয়ার্ড সেভ করার আগে অটোমেটিক এনক্রিপশন (Security) ---
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- পাসওয়ার্ড ম্যাচ করার জন্য কাস্টম মেথড ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// মঙ্গুজ মডেল এক্সপোর্ট (ES Module Format)
const User = mongoose.model('User', userSchema);
export default User;