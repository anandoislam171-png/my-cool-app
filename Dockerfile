# ১. নোড ইমেজ সিলেক্ট করা (লাইটওয়েট ভার্সন)
FROM node:20-alpine

# ২. ডিরেক্টরি সেটআপ
WORKDIR /app

# ৩. ডিপেন্ডেন্সি কপি ও ইন্সটল
COPY package*.json ./
RUN npm install --production

# ৪. সব কোড কপি করা
COPY . .

# ৫. পোর্ট এক্সপোজ করা (তোমার ব্যাকএন্ড পোর্ট ১০০০০)
EXPOSE 10000

# ৬. সার্ভার রান করার কমান্ড
CMD ["npm", "start"]