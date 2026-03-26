import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    // ১. কন্টিনজেন্সি: চ্যাট টাইপ আইডেন্টিফিকেশন
    conversationId: {
      type: String, 
      index: true,
      required: [true, "Conversation ID is required"]
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
      index: true
    },

    // ২. সেন্ডার ডিটেইলস (Neural Identity)
    senderId: {
      type: String, 
      required: [true, "Sender ID is required"],
      index: true
    },
    senderName: { 
      type: String,
      default: "Unknown Drifter" 
    },
    senderAvatar: { 
      type: String,
      default: ""
    },

    // ৩. ইউনিক আইডেন্টিফায়ার (Client-side tracking এর জন্য)
    tempId: { 
      type: String, 
      sparse: true  
    },

    // ৪. কন্টেন্ট এবং মিডিয়াম (Cloudinary ইমেজ বা টেক্সট)
    text: {
      type: String,
      trim: true,
      default: ""
    },
    media: {
      type: String, // আপনার Cloudinary image URL এখানে সেভ হবে
      default: ""
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "video", "voice", "file", "neural-thought"],
      default: "text"
    },

    // 🚀 ফিচার ১: EMOTIONAL SIGNATURE
    neuralMood: {
      type: String,
      enum: ["Neutral", "Happy", "Sad", "Enraged", "Ecstatic", "Anxious", "Neural-Flow"],
      default: "Neural-Flow"
    },

    // 🚀 ফিচার ২: THE TIME CAPSULE (মেসেজ পরে ডেলিভারি হবে)
    isTimeCapsule: {
      type: Boolean,
      default: false
    },
    deliverAt: {
      type: Date,
      default: Date.now,
      index: true 
    },

    // 🚀 ফিচার ৩: DIGITAL LEGACY
    isLegacyMessage: {
      type: Boolean,
      default: false
    },
    autonomousReplyEnabled: {
      type: Boolean,
      default: false 
    },

    // ৫. স্ট্যাটাস এবং মেটাডাটা
    seenBy: [
      {
        userId: String,
        seenAt: { type: Date, default: Date.now }
      }
    ],
    isEdited: {
      type: Boolean,
      default: false
    },

    // ৬. PRIVACY & SELF-DESTRUCT (Episodic Memory)
    isSelfDestruct: {
      type: Boolean,
      default: false
    },
    expireAt: {
      type: Date,
      default: null,
      index: true 
    }
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ==========================================================
    📡 PERFORMANCE & OPTIMIZATION
========================================================== */

// ১. TTL Index (অটোমেটিক ডিলিট লজিক)
MessageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// ২. চ্যাট লোডিং স্পিড বাড়ানোর জন্য ইনডেক্স
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// ৩. ভার্চুয়াল ফিল্ড: চেক করবে মেসেজটি কি বর্তমানে লক করা (Time Capsule এর জন্য)
MessageSchema.virtual('isLocked').get(function() {
  return this.deliverAt && new Date() < this.deliverAt;
});

// ৪. প্রি-সেভ হুক (Pre-save Hook)
MessageSchema.pre('save', function(next) {
  // যদি self-destruct অন থাকে কিন্তু expireAt দেওয়া না থাকে, তবে ৩০ সেকেন্ড ডিফল্ট
  if (this.isSelfDestruct && !this.expireAt) {
    this.expireAt = new Date(Date.now() + 30 * 1000); 
  }

  // মিডিয়া টাইপ অটো-ডিটেকশন লজিক (যদি ফ্রন্টএন্ড থেকে না আসে)
  if (this.media && this.mediaType === "text") {
    this.mediaType = "image";
  }

  // টাইম ক্যাপসুল ভ্যালিডেশন
  if (this.deliverAt && this.deliverAt > new Date()) {
    this.isTimeCapsule = true;
  }
  
  next();
});

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export default Message;
