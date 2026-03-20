import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ১. DIGITAL IDENTITY & CUSTOM AUTH */
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true, 
      index: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false // সুরক্ষার জন্য ডিফল্টভাবে এটি কুয়েরিতে আসবে না
    }, 
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    nickname: { 
      type: String, 
      trim: true, 
      unique: true, 
      sparse: true 
    },
    email: { 
      type: String, 
      lowercase: true, 
      trim: true, 
      sparse: true, 
      unique: true, 
      index: true 
    },
    auth0Id: { 
      type: String, 
      unique: true, 
      sparse: true, 
      index: true 
    },

    /* ২. AI & NEURAL INTEGRATION */
    neuralPatterns: {
      meetingTimes: [String],
      frequentContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      busyHours: [Number]
    },
    avatar: { type: String, default: "" },
    coverImg: { type: String, default: "" }, // প্রোফাইল পেজের জন্য এটি দরকার হতে পারে
    aiTwinAvatar: { type: String, default: "" },
    aiPersona: { type: String, default: "Neural Drifter" },
    bio: { type: String, default: "System Drifter // Neural Integrity: High", maxlength: 160 },
    aiAutopilot: { type: Boolean, default: true },
    aiTone: { type: Number, default: 50, min: 0, max: 100 },
    ghostMode: { type: Boolean, default: false },

    /* ৩. EMOTION & RANKING */
    moodStats: {
      motivated: { type: Number, default: 40 },
      creative: { type: Number, default: 30 },
      calm: { type: Number, default: 20 },
      stressed: { type: Number, default: 10 }
    },
    neuralImpact: { type: Number, default: 0 },
    drifterLevel: { 
      type: String, 
      enum: ["Novice Drifter", "Signal Voyager", "Time Architect", "Neural Overlord"], 
      default: "Novice Drifter" 
    },

    /* ৪. DEATH-SWITCH & LEGACY */
    deathSwitch: {
      isActive: { type: Boolean, default: false },
      inactivityThresholdMonths: { type: Number, default: 12 },
      lastPulseTimestamp: { type: Date, default: Date.now }
    },

    /* ৫. MEMORY VAULT */
    memoryVault: [{
        content: String,
        media: String,
        emotionVector: [Number],
        createdAt: { type: Date, default: Date.now }
    }],

    /* ৬. SOCIAL GRAPH (ORBIT SYSTEM) */
    // এটি স্ট্রিং (Auth0 ID) অথবা ObjectId (DB ID) দুটোর যেকোনো একটির জন্য ফ্লেক্সিবল রাখা হয়েছে
    followers: [{ type: String }], 
    following: [{ type: String }],
    blockedUsers: [{ type: String }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* Virtuals: ডাটাবেসে সেভ না করেই ডাটা দেখানোর জন্য */
userSchema.virtual('followerCount').get(function() { 
  return this.followers ? this.followers.length : 0; 
});

userSchema.virtual('followingCount').get(function() { 
  return this.following ? this.following.length : 0; 
});

/* Optimized Indexing: সার্চ স্পিড বাড়ানোর জন্য */
userSchema.index({ username: 1, name: 1 });
userSchema.index({ "deathSwitch.lastPulseTimestamp": 1 });
userSchema.index({ neuralImpact: -1 });

// Model Export (Next.js বা Express উভয়ের জন্যই নিরাপদ)
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;