import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // অথবা আপনার পছন্দমতো মেইল সার্ভিস
  auth: {
    user: process.env.EMAIL_USER, // আপনার ইমেইল
    pass: process.env.EMAIL_PASS, // আপনার অ্যাপ পাসওয়ার্ড (App Password)
  },
});

export default transporter;