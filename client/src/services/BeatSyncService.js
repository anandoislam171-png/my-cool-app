/* ==========================================================
    Onyx Drift - Beat Sync Engine (Audio Analysis)
========================================================== */

/**
 * ১. Peak Detection Algorithm (দ্রুত বিট ডিটেকশন)
 * এই ফাংশনটি অডিওর ভলিউম স্পাইকগুলো খুঁজে বের করে।
 */
export const detectBeats = async (audioUrl) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error("AudioContext not supported");

    const audioCtx = new AudioContext();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    const peaks = [];
    const threshold = 0.8; // বিট সেন্সিটিভিটি (কমলে আরও বেশি বিট ধরবে)
    const minInterval = 0.25; // দুটি বিটের মধ্যে ন্যূনতম দূরত্ব (সেকেন্ডে)

    for (let i = 0; i < channelData.length; i += 1024) {
      const volume = Math.abs(channelData[i]);
      const time = i / sampleRate;

      if (volume > threshold) {
        if (peaks.length === 0 || time - peaks[peaks.length - 1] > minInterval) {
          peaks.push(Number(time.toFixed(2))); // ২ দশমিক পর্যন্ত সময় রাখা হচ্ছে
        }
      }
    }

    // কাজ শেষ হলে AudioContext বন্ধ করা ভালো (মেমোরি সেভ হবে)
    await audioCtx.close();
    return peaks; 

  } catch (error) {
    console.error("Beat Detection Error:", error);
    return [];
  }
};

/**
 * ২. Intensity Analysis (প্রতি সেকেন্ডে মিউজিকের তীব্রতা)
 * এটি ভিডিও এডিটিং বা ব্যাকগ্রাউন্ড অ্যানিমেশনের জন্য দারুণ।
 */
export const getBeatTimestamps = async (audioUrl) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const beats = [];
    
    // প্রতি ১ সেকেন্ড অন্তর অ্যানালাইসিস
    for (let i = 0; i < rawData.length; i += sampleRate) {
      let sum = 0;
      let count = 0;

      // ১ সেকেন্ডের ডেটা লুপ করা
      for (let j = 0; j < sampleRate && (i + j) < rawData.length; j++) {
        sum += Math.abs(rawData[i + j]);
        count++;
      }

      const averageIntensity = sum / count;
      if (averageIntensity > 0.15) { // Threshold
        beats.push(Number((i / sampleRate).toFixed(2)));
      }
    }

    await audioContext.close();
    return beats;

  } catch (error) {
    console.error("Intensity Analysis Error:", error);
    return [];
  }
};