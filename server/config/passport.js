import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback", // এটি আপনার ব্যাকএন্ডের ইউআরএল অনুযায়ী হবে
      proxy: true, // Render/Vercel এ ডেপ্লয় করলে এটি মাস্ট লাগবে
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ১. চেক করো ইউজার অলরেডি ডাটাবেজে আছে কি না (ইমেইল দিয়ে)
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // ইউজার থাকলে তাকে রিটার্ন করো
          return done(null, user);
        } else {
          // ২. ইউজার না থাকলে নতুন ইউজার তৈরি করো
          const newUser = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split('@')[0], // ইমেইলের প্রথম অংশ ইউজারনেম হিসেবে
            avatar: profile.photos[0].value,
            password: 'google-auth-no-password', // গুগল লগইনে পাসওয়ার্ড লাগে না, তবে মডেল রিকোয়ার্ড হলে একটি ডামি দিন
            activeMode: 'minimal',
          });
          return done(null, newUser);
        }
      } catch (err) {
        console.error("❌ Google Auth Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

// সেশন হ্যান্ডলিং (যদিও আমরা JWT ব্যবহার করছি, পাসপোর্ট মডিউলের জন্য এগুলো প্রয়োজন হতে পারে)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;